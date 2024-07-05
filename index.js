import puppeteer from "puppeteer";
import fs from 'fs';

const result = [];

const url = "https://www.linkedin.com/jobs/search/?currentJobId=3956372884&geoId=103644278&keywords=MLOps&location=United%20States&position=17&pageNum=0"


//attempted to make the code itself to input the word "MLOps" and press the search
//it was timing out & I was short on time so I searched for MLOps and used the link where MLOps is specified in it

// const inputSelector = '#job-search-bar-keywords';
// const searchWord = 'MLOps';
// const buttonSelector = '.large-icon';
// 
// await page.waitForSelector(inputSelector);
// await page.type(inputSelector, searchWord);
// await page.waitForSelector(buttonSelector);
// await page.click(buttonSelector);
// await page.waitForNavigation();


const main = async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    //main scraping code
    const allJobs = await page.evaluate(()=>{
        const jobList = Array.from(document.querySelectorAll('a.base-card__full-link'));
        return jobList.map(links=>links.href);

    });
    // console.log(allJobs);
    //entering individual pages and retrieving data from it
    for(const link of allJobs){
        await page.goto(link);
        await page.waitForSelector('div');
        // I'm writing the code while not logged in
        const allInfo = await page.evaluate(()=>{

            const cleanText = (selector) => {
                const element = document.querySelector(selector);
                return element ? element.textContent.replace(/\s+/g, ' ').trim() : 'N/A';
              };
              
            const title = cleanText('h1.top-card-layout__title');
            const companyName = cleanText('a.topcard__org-name-link');
            const location = cleanText('span.topcard__flavor.topcard__flavor--bullet');
            const description = cleanText('div.show-more-less-html__markup.relative.overflow-hidden');
            const postedDate = cleanText('span.posted-time-ago__text');
            // since i'm not logged in, skills does not appear. it would look as follow:
            // const skills = cleanText('a.app-aware-link.job-details-how-you-match__skills-item-subtitle');
            // it will be added to the returned object too
            return {title,companyName,location,description,postedDate}


        })
        //link added
        allInfo["link"]=link;
        result.push(allInfo);
    }

    await browser.close();
    // console.log(result);
    return result;
}

async function saveResultsToFile(result) {

    const jsonContent = JSON.stringify(result, null, 2);
  
    fs.writeFile('data.json', jsonContent, 'utf8', (err) => {
      if (err) {
        console.error('An error occurred while writing JSON Object to File.');
        return console.error(err);
      }
      console.log('JSON file has been saved.');
    });
  }

  (async () => {
  const results = await main();
  await saveResultsToFile(results);
})();







