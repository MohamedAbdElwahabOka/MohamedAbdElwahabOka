const fs = require('fs');
const path = require('path');

const quotes = [
    "“First, solve the problem. Then, write the code.” – John Johnson",
    "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde",
    "“Java is to JavaScript what car is to Carpet.” – Chris Heilmann",
    "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
    "“Fix the cause, not the symptom.” – Steve Maguire",
    "“Simplicity is the soul of efficiency.” – Austin Freeman",
    "“Make it work, make it right, make it fast.” – Kent Beck",
    "“Before software can be reusable it first has to be usable.” – Ralph Johnson"
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
const readmePath = path.join(__dirname, '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// ده الفورمات اللي هيظهر في الريدمي
const newContent = `<h3 align="center">⭐ ${randomQuote}</h3>
`;

const quoteRegex = /[\s\S]*/;
readmeContent = readmeContent.replace(quoteRegex, newContent);

fs.writeFileSync(readmePath, readmeContent);
console.log('✅ Quote updated: ' + randomQuote);
