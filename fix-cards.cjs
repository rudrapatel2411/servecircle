const fs = require('fs');
const path = require('path');

const dir = 'd:\\ServeCircle\\client\\src\\pages\\customer';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Hub.jsx') && f !== 'CategoryHub.jsx');

files.forEach(f => {
  let p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('<Link key={service.id}')) {
    
    // 1. imports
    content = content.replace(/import \{([^}]*)\} from 'react-router-dom';/, (match, p1) => {
      if (!p1.includes('useNavigate')) {
        return `import {${p1}, useNavigate } from 'react-router-dom';`;
      }
      return match;
    });

    // 2. hook
    content = content.replace(/const \{ t \} = useTranslation\(\);/, `const { t } = useTranslation();\n  const navigate = useNavigate();`);

    // 3. Link replacement
    content = content.replace(/<Link key=\{service.id\} to=\{([^}]+)\} className="service-card hover-lift"/, (match, toPath) => {
      return `<div\n            key={service.id}\n            onClick={() => navigate(${toPath})}\n            className="service-card hover-lift"`;
    });

    // 4. Update the style to include cursor: 'pointer'
    // Since the original has `style={{ '--card-accent': '#8b5cf6', display: ... }}`
    content = content.replace(/style=\{\{ (.*?)(?= \}\})/g, (match, p1) => {
      if (match.includes('--card-accent') && !match.includes('cursor:')) {
        return `style={{ cursor: 'pointer', ${p1}`;
      }
      return match;
    });

    // 5. Replace </Link> with </div> inside the map
    // We only want to replace the closing Link tag for the card
    content = content.replace(/<\/Link>\n\s*\}\)\}/g, '</div>\n        })}');

    fs.writeFileSync(p, content);
    console.log('Fixed ' + f);
  }
});
