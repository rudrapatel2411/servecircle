const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const colorMap = {
  '#10b981': '#3b7dc1', // primary-500
  '#059669': '#2960a0', // primary-600
  '#047857': '#224c82', // primary-700
  '#d1fae5': '#e1ebf5', // primary-100
  '#ecfdf5': '#f0f5fa', // primary-50
  '#a7f3d0': '#c2d7ea', // primary-200
  '#6ee7b7': '#94bce0', // primary-300
  '#34d399': '#609cd2', // primary-400
  'rgba(5, 150, 105,': 'rgba(59, 125, 193,', 
  'rgba(16, 185, 129,': 'rgba(59, 125, 193,'
};

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;
      
      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        // Case-insensitive regex replacement for hex codes
        const regex = new RegExp(oldColor.replace('(', '\\(').replace(')', '\\)'), 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newColor);
          updated = true;
        }
      }

      if (updated) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  });
}

walkDir(directoryPath);
console.log("Color replacement complete.");
