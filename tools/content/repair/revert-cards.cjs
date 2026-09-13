const fs = require('fs');
const path = require('path');

const dir = 'd:\\ServeCircle\\client\\src\\pages\\customer';
const files = fs.readdirSync(dir).filter(f => f.endsWith('Hub.jsx'));

files.forEach(f => {
  let p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  let changed = false;

  // 1. Revert <div onClick... for service cards back to <Link to...
  const cardRegex = /<div(\s+)key=\{service\.id\}\s+onClick=\{\(\) => navigate\(([^)]+)\)\}(\s+)className="service-card hover-lift"\s+style=\{\{\s*cursor:\s*'pointer',\s*/g;
  if (cardRegex.test(content)) {
    content = content.replace(cardRegex, '<Link$1key={service.id} to={$2}$3className="service-card hover-lift" style={{ ');
    changed = true;
  }

  // 2. Revert <div onClick... for "Back to Directory" back to <Link to...
  const backRegex = /<div onClick=\{\(\) => navigate\('(\/customer\/services)'\)\}\s+className="sidebar-link"\s+style=\{\{\s*cursor:\s*'pointer',\s*/g;
  if (backRegex.test(content)) {
    content = content.replace(backRegex, '<Link to="$1" className="sidebar-link" style={{ ');
    changed = true;
  }

  // 3. Revert </div> for the card closing back to </Link>
  // This might be tricky because there are many </div>. We look for the one right before `))} `
  if (changed) {
    content = content.replace(/<\/div>\n\s*\}\)\}/g, '</Link>\n        })}');
  }

  if (changed) {
    fs.writeFileSync(p, content);
    console.log('Reverted ' + f);
  }
});
