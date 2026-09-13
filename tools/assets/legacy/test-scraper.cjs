const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  const html = await fetch('https://html.duckduckgo.com/html/?q=plumbing+service');
  const match = html.match(/<img[^>]+src="([^"]+)"/g);
  if (match) {
    console.log("Found matches:", match.slice(0, 3));
  } else {
    console.log("Not found");
  }
}
test();
