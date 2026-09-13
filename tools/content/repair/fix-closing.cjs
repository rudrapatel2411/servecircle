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
  
  // Replace the exact closing sequence for the Link map
  // from:
  //           </div>
  //         ))}
  // to:
  //           </Link>
  //         ))}
  
  // We can use a regex that matches `</div>` followed by whitespace and `))}`
  content = content.replace(/<\/div>(\s*)\}\)\}/g, '</Link>$1})}');
  
  fs.writeFileSync(p, content);
  console.log('Fixed ' + f);
});
