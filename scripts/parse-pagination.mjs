import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('temp_extracted.html', 'utf8');
const $ = cheerio.load(html);

const urls = [];
$('.pagination a').each((i, el) => {
    const url = $(el).attr('href');
    if (url) urls.push($(el).text().trim() + ' -> ' + url);
});

console.log(`Found ${urls.length} pagination URLs on the page:`);
console.log(urls.join('\n'));
