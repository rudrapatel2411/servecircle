const fs = require('fs');
const path = require('path');

const dir = 'd:\\ServeCircle\\client\\src\\pages\\customer';
const files = [
  'CategoryHub.jsx',
  'VehicleServicesHub.jsx',
  'HomeRepairsHub.jsx',
  'CleaningHygieneHub.jsx',
  'FurnitureDecorHub.jsx'
];

files.forEach(f => {
  let p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  if (!content.includes('import { Link }')) {
    // Some might already import something else from react-router-dom, like useNavigate.
    // If it imports from 'react-router-dom', we can add Link to it.
    if (content.includes("from 'react-router-dom';")) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'react-router-dom';/, (match, group1) => {
        if (!group1.includes('Link')) {
          return `import { ${group1.trim()}, Link } from 'react-router-dom';`;
        }
        return match;
      });
    } else {
      // Add it after react imports
      content = content.replace(/import React[^;]+;/, match => `${match}\nimport { Link } from 'react-router-dom';`);
    }
    fs.writeFileSync(p, content);
    console.log('Added Link import to ' + f);
  }
});
