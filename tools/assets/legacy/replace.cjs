const fs = require('fs');
const path = require('path');
const dir = 'd:/ServeCircle/client/src/pages/customer';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('Hub.jsx')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Replace import
    content = content.replace(
      /import { getServiceImage } from '\.\.\/\.\.\/utils\/imageHelpers';/g, 
      "import ServiceImage from '../../components/ServiceImage';"
    );
    
    // Replace component tag
    // <img src={getServiceImage(service.id)} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
    content = content.replace(
      /<img src={getServiceImage\(service\.id\)} alt={t\(service\.nameKey\)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" \/>/g,
      "<ServiceImage serviceId={service.id} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />"
    );
    
    fs.writeFileSync(path.join(dir, file), content);
  }
});

console.log('Replaced successfully');
