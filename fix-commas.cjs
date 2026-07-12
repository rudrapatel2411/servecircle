const fs = require('fs');

const files = ['client/src/i18n/en.js', 'client/src/i18n/hi.js', 'client/src/i18n/gu.js'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove the stray comma that's causing the syntax error
  // The error is: `services: servicesData,\n,`
  content = content.replace(/servicesData,\s*,/g, 'servicesData,');
  // Or more generally, replace any double comma at the end of objects
  content = content.replace(/,\s*,/g, ',');
  
  fs.writeFileSync(file, content);
  console.log(`Fixed syntax in ${file}`);
});
