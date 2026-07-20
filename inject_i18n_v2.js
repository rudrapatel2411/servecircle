const fs = require('fs');

const b2bI18n = JSON.parse(fs.readFileSync('b2bClient-i18n.json', 'utf8'));

['en', 'hi', 'gu'].forEach(lang => {
  const filePath = `client/src/i18n/${lang}.js`;
  let fileContent = fs.readFileSync(filePath, 'utf8');

  // Find where the object ends and the export default begins.
  // It usually looks like `};\nexport default en;`
  
  // First, check if b2bClient is already injected at the end (from my previous failed attempts that didn't work).
  if (fileContent.includes('b2bClient: {') && !fileContent.includes('b2bClient: {"')) {
      console.log(`b2bClient already present in ${lang}`);
      return;
  }

  // Safely remove the closing brace of the main object and the export statement
  // We'll replace the last match of `};\s*export default ${lang};`
  const exportRegex = new RegExp(`};\\s*export default ${lang};\\s*$`);
  
  if (exportRegex.test(fileContent)) {
    const b2bClientStr = `,\n  b2bClient: ${JSON.stringify(b2bI18n[lang], null, 4)}\n};\nexport default ${lang};\n`;
    fileContent = fileContent.replace(exportRegex, b2bClientStr);
    fs.writeFileSync(filePath, fileContent);
    console.log(`Updated ${lang}.js with correct regex`);
  } else {
    // Maybe it doesn't match the regex. Let's try splitting on `export default`
    const parts = fileContent.split(`export default ${lang};`);
    if (parts.length >= 2) {
      let mainObj = parts[0];
      // remove trailing whitespace and the last closing brace
      mainObj = mainObj.trim().replace(/};$/, '');
      const newStr = mainObj + `,\n  b2bClient: ${JSON.stringify(b2bI18n[lang], null, 4)}\n};\nexport default ${lang};\n`;
      fs.writeFileSync(filePath, newStr);
      console.log(`Updated ${lang}.js via split fallback`);
    } else {
      console.log(`Could not find export default in ${lang}.js`);
    }
  }
});
