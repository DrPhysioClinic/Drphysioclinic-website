import fs from 'fs';
const raw = fs.readFileSync("/Users/raahildesai/.gemini/antigravity-ide/brain/1a11d2b9-b874-40c0-b1cf-bbd10e00a2a6/.system_generated/steps/2099/output.txt", 'utf-8');
const obj = JSON.parse(raw);
const resultStr = obj.result;
// the typescript code is inside the markdown ```typescript ... ``` or directly in the untrusted-data block
const match = resultStr.match(/<untrusted-[^>]+>\n(.*)\n<\/untrusted-[^>]+>/s);
if (match) {
  let content = match[1];
  try {
    const parsed = JSON.parse(content);
    if (parsed.length > 0 && parsed[0].text) content = parsed[0].text;
  } catch(e) {}
  fs.writeFileSync('src/types/database.ts', content);
  console.log("Written successfully");
} else {
  console.log("No match found in result string");
}
