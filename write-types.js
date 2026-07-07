const fs = require('fs');
const content = fs.readFileSync('/Users/raahildesai/.gemini/antigravity-ide/brain/74d28e80-c4db-4657-ad9f-31de71ed894e/.system_generated/steps/1475/output.txt', 'utf-8');
const parsed = JSON.parse(content);
fs.writeFileSync('/Users/raahildesai/Raahil CP/Projects/Dr.physio.clinic/Dr-physio-landing-page/src/types/database.ts', parsed.types);
console.log("Types updated.");
