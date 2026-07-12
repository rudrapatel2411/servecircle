const https = require('https');

const ids = [
  '1581578731548-c64695cc6952', // cleaning
  '1527515637462-cff94eecc1ac', // vacuuming
  '1584622650111-993a426fbf0a', // bathroom
  '1558222218-b7b54eede3f3', // vacuum sofa
  '1584820927500-ca22df9f1cc4', // kitchen
  '1574269909862-7e1d70bb8078', // fridge
  '1620023640277-c93d9ce459bd', // pest control
  '1585704032915-c3400ca199e7' // water tank
];

ids.forEach(id => {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=300&q=60`;
  https.get(url, (res) => {
    console.log(`${id}: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(e);
  });
});
