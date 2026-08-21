const fs = require('fs');
const { Client } = require('@notionhq/client');

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/NOTION_API_KEY=(.*)/)[1].trim();
const dbId = env.match(/NOTION_DATABASE_ID=(.*)/)[1].trim();

const notion = new Client({ auth: key });

async function testNotion() {
  try {
    const response = await notion.databases.query({ database_id: dbId });
    console.log('Success! Found ' + response.results.length + ' rows.');
    if (response.results.length > 0) {
      console.log('\n--- SCHEMA OF FIRST ROW ---');
      console.log(JSON.stringify(response.results[0].properties, null, 2));
    }
  } catch (error) {
    console.error(error);
  }
}

testNotion();
