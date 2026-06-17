const fs=require('fs'); 
const cheerio=require('cheerio'); 
const $=cheerio.load(fs.readFileSync('temp_extracted.html')); 
console.log($('.updateContainer').first().html());
