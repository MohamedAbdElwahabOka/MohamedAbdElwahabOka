const fs = require("fs");
const path = require("path");

const USER = "MohamedAbdElwahabOka";
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) { console.error("No GITHUB_TOKEN"); process.exit(1); }

const query = `query($login:String!){
  user(login:$login){
    followers{totalCount}
    repositories(ownerAffiliations:OWNER,isFork:false,first:100){
      totalCount
      nodes{stargazerCount}
    }
    contributionsCollection{
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar{
        totalContributions
        weeks{contributionDays{date contributionCount}}
      }
    }
  }
}`;

(async () => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!json.data) { console.error(JSON.stringify(json)); process.exit(1); }
  const u = json.data.user;
  const c = u.contributionsCollection;

  const days = c.contributionCalendar.weeks.flatMap(w => w.contributionDays);
  const today = new Date().toISOString().slice(0, 10);
  // streak: count back from today (or yesterday if today has no commits yet)
  let i = days.length - 1;
  if (days[i].date === today && days[i].contributionCount === 0) i--;
  let streak = 0;
  for (; i >= 0 && days[i].contributionCount > 0; i--) streak++;
  let best = 0, cur = 0;
  for (const d of days) { cur = d.contributionCount > 0 ? cur + 1 : 0; best = Math.max(best, cur); }
  const last30 = days.slice(-30).reduce((s, d) => s + d.contributionCount, 0);
  const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

  const block = `<!-- STATS:START -->
<div align="center">

| 🔥 Current streak | 🏆 Longest streak | 📅 Last 30 days | 📈 Past year |
|:---:|:---:|:---:|:---:|
| **${streak}** days | **${best}** days | **${last30}** contributions | **${c.contributionCalendar.totalContributions}** contributions |

| 💾 Commits | 🔀 Pull requests | 🐛 Issues | 📦 Public repos | ⭐ Stars | 👥 Followers |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ${c.totalCommitContributions} | ${c.totalPullRequestContributions} | ${c.totalIssueContributions} | ${u.repositories.totalCount} | ${stars} | ${u.followers.totalCount} |

<sub>Updated daily · ${today}</sub>

</div>
<!-- STATS:END -->`;

  const p = path.join(__dirname, "../README.md");
  const readme = fs.readFileSync(p, "utf8").replace(/<!-- STATS:START -->[\s\S]*?<!-- STATS:END -->/, block);
  fs.writeFileSync(p, readme);
  console.log(block);
})();
