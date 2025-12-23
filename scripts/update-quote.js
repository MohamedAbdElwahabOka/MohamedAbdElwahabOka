const fs = require("fs");
const path = require("path");

const read = (p, def) => {
    try { return JSON.parse(fs.readFileSync(p, "utf8")); }
    catch { return def; }
};

const quotesPath = path.join(__dirname, "../data/quotes.json");
const lastPath = path.join(__dirname, "../data/last-quote.json");
const logPath = path.join(__dirname, "../data/quote-log.json");
const readmePath = path.join(__dirname, "../README.md");

const quotesByDay = read(quotesPath, {});
const lastQuote = read(lastPath, { quote: "" });
const log = read(logPath, []);

const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
const todayQuotes = quotesByDay[day] || [];

if (!todayQuotes.length) process.exit(0);

// منع التكرار
const filtered = todayQuotes.filter(q => q !== lastQuote.quote);
const selected = filtered.length
    ? filtered[Math.floor(Math.random() * filtered.length)]
    : todayQuotes[0];

// ألوان تلقائية
const colors = ["#6bd6ad", "#61dafb", "#facc15", "#f472b6", "#c084fc"];
const color = colors[Math.floor(Math.random() * colors.length)];

let readme = fs.readFileSync(readmePath, "utf8");

const newBlock = `
<!-- QUOTE:START -->
<h3 align="center" style="color:${color}">
⭐ ${selected}
<br/><sub>${day} Motivation</sub>
</h3>
<!-- QUOTE:END -->
`;

readme = readme.replace(
    /<!-- QUOTE:START -->[\s\S]*?<!-- QUOTE:END -->/,
    newBlock
);

fs.writeFileSync(readmePath, readme);

// حفظ الحالة
fs.writeFileSync(lastPath, JSON.stringify({ quote: selected }, null, 2));

// Log
log.push({
    quote: selected,
    day,
    date: new Date().toISOString()
});
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

console.log("✅ Quote updated:", selected);
