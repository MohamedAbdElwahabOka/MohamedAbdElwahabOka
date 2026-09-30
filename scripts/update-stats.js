const fs = require("fs");
const path = require("path");

const USER = "MohamedAbdElwahabOka";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) { console.error("No GITHUB_TOKEN"); process.exit(1); }

const gql = async (query, variables) => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!json.data) { console.error(JSON.stringify(json)); process.exit(1); }
  return json.data;
};

const profileQuery = `query($login:String!){
  user(login:$login){
    createdAt
    followers{totalCount}
    repositories(ownerAffiliations:OWNER,isFork:false,first:100){
      totalCount
      nodes{stargazerCount}
    }
  }
}`;

const yearQuery = `query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){
    contributionsCollection(from:$from,to:$to){
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar{
        totalContributions
        weeks{contributionDays{date contributionCount}}
      }
    }
  }
}`;

const fmt = n => n.toLocaleString("en-US");

(async () => {
  const { user: u } = await gql(profileQuery, { login: USER });
  const startYear = new Date(u.createdAt).getUTCFullYear();
  const now = new Date();

  const t = { commits: 0, prs: 0, issues: 0, reviews: 0, restricted: 0, total: 0 };
  const dayMap = new Map();

  // one query per calendar year (GitHub caps a window at 1 year)
  for (let y = startYear; y <= now.getUTCFullYear(); y++) {
    const from = `${y}-01-01T00:00:00Z`;
    const endOfYear = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
    const to = (endOfYear < now ? endOfYear : now).toISOString();
    const { user } = await gql(yearQuery, { login: USER, from, to });
    const c = user.contributionsCollection;
    t.commits += c.totalCommitContributions;
    t.prs += c.totalPullRequestContributions;
    t.issues += c.totalIssueContributions;
    t.reviews += c.totalPullRequestReviewContributions;
    t.restricted += c.restrictedContributionsCount;
    t.total += c.contributionCalendar.totalContributions;
    for (const w of c.contributionCalendar.weeks)
      for (const d of w.contributionDays) dayMap.set(d.date, d.contributionCount);
  }

  const days = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const today = now.toISOString().slice(0, 10);
  const counts = days.filter(([d]) => d <= today).map(([, n]) => n);

  // current streak (today may still be empty)
  let i = counts.length - 1;
  if (counts[i] === 0) i--;
  let streak = 0;
  for (; i >= 0 && counts[i] > 0; i--) streak++;
  let best = 0, cur = 0;
  for (const n of counts) { cur = n > 0 ? cur + 1 : 0; best = Math.max(best, cur); }
  const last30 = counts.slice(-30).reduce((s, n) => s + n, 0);
  const activeDays = counts.filter(n => n > 0).length;
  const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

  const cell = (icon, label, value) =>
    `    <td align="center"><h2>${value}</h2><sub>${icon} ${label}</sub></td>`;

  const block = `<!-- STATS:START -->
<div align="center">

<b>Activity</b>

<table>
  <tr>
${cell("🔥", "Current streak", `${streak}d`)}
${cell("🏆", "Longest streak", `${best}d`)}
${cell("📅", "Last 30 days", fmt(last30))}
${cell("🗓️", "Active days", fmt(activeDays))}
${cell("🚀", "Total contributions", fmt(t.total))}
${cell("👥", "Followers", fmt(u.followers.totalCount))}
  </tr>
</table>

<br/>

<b>All time</b>

<table>
  <tr>
${cell("💾", "Commits", fmt(t.commits))}
${cell("🔀", "Pull requests", fmt(t.prs))}
${cell("🐛", "Issues", fmt(t.issues))}
${cell("🔒", "Private contributions", fmt(t.restricted))}
${cell("📦", "Public repos", fmt(u.repositories.totalCount))}
${cell("⭐", "Stars", fmt(stars))}
  </tr>
</table>

</div>
<!-- STATS:END -->`;

  const p = path.join(__dirname, "../README.md");
  const readme = fs.readFileSync(p, "utf8").replace(/<!-- STATS:START -->[\s\S]*?<!-- STATS:END -->/, block);
  fs.writeFileSync(p, readme);
  console.log(t, { streak, best, last30, activeDays, stars });
})();
