import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('temp_extracted.html', 'utf8');
const $ = cheerio.load(html);

const urls = [];
$('.updateContainer').each((i, el) => {
    const url = $(el).find('a.view-update-details').attr('href');
    if (url) urls.push(url);
});

console.log(`Found ${urls.length} URLs on the page:`);
console.log(urls.join('\n'));
