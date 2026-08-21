const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/NOTION_API_KEY=(.*)/)[1].trim();
const dbId = env.match(/NOTION_DATABASE_ID=(.*)/)[1].trim();

async function testNotion() {
  try {
    const res = await fetch('https://api.notion.com/v1/databases/' + dbId + '/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    if (!res.ok) {
      console.log('Error:', data);
      return;
    }
    
    console.log('Success! Found ' + data.results.length + ' rows.');
    if (data.results.length > 0) {
      console.log('\n--- SCHEMA OF FIRST ROW ---');
      console.log(JSON.stringify(data.results[0].properties, null, 2));
    }
  } catch (error) {
    console.error(error);
  }
}

testNotion();
