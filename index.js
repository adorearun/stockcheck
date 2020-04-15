const puppeteer = require('puppeteer');
const Promise = require('bluebird');
const fs = require('fs');
const moment = require('moment');
const { WebClient } = require('@slack/web-api');

//require('./client.env').config();



const file = require('./items');

const items = file.items;
// An access token (from your Slack app or custom integration - xoxp, xoxb)
//console.log("token ==",process.env.token );
const token ='<token>'; 
const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = process.env.channelD;
async function checkItem(page, item) {
  console.log(`Checking ${item.name}`);
  await page.goto(item.url);

  const canAdd = await page.$('#add-to-cart-button');
  const notInStock = (await page.content()).match(/in stock on/gi);

  return canAdd && !notInStock;
}


async function sendSlackMessage(item){
  const res = await web.chat.postMessage({ channel: '#<channelname>', text: `${item.name} available! ${item.url}`});
  console.log('Message sent: ', res.ts);
}

async function run() {
  console.log('');
  console.log(`Starting at ${moment().toISOString()}`);
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setViewport({
    width: 1680,
    height: 1050
  });

  await Promise.map(
    items,
    async item => {
      const oneDayAgo = moment().subtract(1, 'days');
      if (!item.found || moment(item.found).isBefore(oneDayAgo)) {
        const available = await checkItem(page, item);

        if (available) {
          item.found = moment().toISOString();
          console.log(`------${item.name} is available.------`);
          await sendSlackMessage(item);
        } else {
          console.log(`--------${item.name} is not available.------`);
        }
        console.log('Waiting...');
        return Promise.delay(4000);
      }
    },
    { concurrency: 1 }
  );

  const update = { items: items };
  console.log('----finishing...');
  fs.writeFileSync('items.json', JSON.stringify(update, null, 4));
  await browser.close();
  console.log('-----browser closed');
  return;
}

run();

setInterval(async function() {
  await run();
 
  console.log('---Polling 15 minutes');
}, 15 * 60 * 1000);
