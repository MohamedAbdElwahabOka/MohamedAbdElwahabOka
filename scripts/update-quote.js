const fs = require("fs");
const path = require("path");

const quotes = [
    "“First, solve the problem. Then, write the code.” – John Johnson",
    "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde",
    "“Java is to JavaScript what car is to Carpet.” – Chris Heilmann",
    "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
    "“Fix the cause, not the symptom.” – Steve Maguire",
    "“Simplicity is the soul of efficiency.” – Austin Freeman",
    "“Make it work, make it right, make it fast.” – Kent Beck",
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
const readmePath = path.join(__dirname, "..", "README.md");

let readmeContent = fs.readFileSync(readmePath, "utf8");

// تأكد إن التاجز موجودة
if (
    !readmeContent.includes("<!-- QUOTE:START -->") ||
    !readmeContent.includes("<!-- QUOTE:END -->")
) {
    console.error("❌ Quote markers not found. Aborting.");
    process.exit(1);
}

const newQuoteBlock = `
<!-- QUOTE:START -->
<h3 align="center">⭐ ${randomQuote}</h3>
<!-- QUOTE:END -->
`;

// Regex يستهدف الجزء بين التاجز فقط
const quoteRegex = /<!-- QUOTE:START -->[\s\S]*?<!-- QUOTE:END -->/;

readmeContent = readmeContent.replace(quoteRegex, newQuoteBlock);

fs.writeFileSync(readmePath, readmeContent, "utf8");

console.log("✅ Quote updated:", randomQuote);
