const fs = require('fs');
const path = require('path');

const quotes = [
    "“First, solve the problem. Then, write the code.” – John Johnson",
    "“Experience is the name everyone gives to their mistakes.” – Oscar Wilde",
    "“Java is to JavaScript what car is to Carpet.” – Chris Heilmann",
    "“Code is like humor. When you have to explain it, it’s bad.” – Cory House",
    "“Fix the cause, not the symptom.” – Steve Maguire",
    "“Simplicity is the soul of efficiency.” – Austin Freeman",
    "“Make it work, make it right, make it fast.” – Kent Beck"
];

const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
const readmePath = path.join(__dirname, '..', 'README.md');

// 1. نقرأ الملف
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// 2. نتأكد إن العلامات موجودة أصلاً قبل ما نلمس أي حاجة
if (!readmeContent.includes('') || !readmeContent.includes('')) {
    console.error('❌ Error: Quote tags not found in README.md. Aborting to prevent overwrite.');
    process.exit(1); // نوقف السكريبت فوراً ونطلع إيرور
}

const newContent = `<h3 align="center">⭐ ${randomQuote}</h3>
`;

// 3. التبديل الآمن
const quoteRegex = /[\s\S]*/;
readmeContent = readmeContent.replace(quoteRegex, newContent);

// 4. الحفظ
fs.writeFileSync(readmePath, readmeContent);
console.log('✅ Quote updated successfully: ' + randomQuote);