import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('temp_extracted.html', 'utf8');
const $ = cheerio.load(html);

const paginationLinks = [];
$('a').each((i, el) => {
    const url = $(el).attr('href');
    const text = $(el).text().trim();
    if (url && url.includes('/latest-updates/')) {
        paginationLinks.push(text + ' -> ' + url);
    }
});

console.log(`Found ${paginationLinks.length} pagination links:`);
console.log([...new Set(paginationLinks)].join('\n'));
