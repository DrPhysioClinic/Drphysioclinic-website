import * as cheerio from 'cheerio';
import fs from 'fs';

const html1 = fs.readFileSync('/tmp/updates1.html', 'utf-8');
const $ = cheerio.load(html1);

const updates = [];

$('.updateContainer').each((i, el) => {
    const title = $(el).find('.updateText').text().trim();
    const date = $(el).find('p').first().text().trim(); // Maybe date is a <p>?
    const content = $(el).find('.updateContent').text().trim();
    const url = $(el).find('a.view-update-details').attr('href');
    updates.push({
        title,
        date,
        content,
        url
    });
});

console.log(JSON.stringify(updates, null, 2));
