import * as cheerio from 'cheerio';
import fs from 'fs';

const html1 = fs.readFileSync('/tmp/update_detail.html', 'utf-8');
const $ = cheerio.load(html1);

const title = $('.update-heading, h1, h2').first().text().trim();
const content = $('.update-description, .update-text, .update-details, .col-md-12 p').text().trim();

console.log({
    title,
    content: content.substring(0, 200)
});
