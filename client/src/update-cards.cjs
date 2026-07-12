const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'VehicleServicesHub.jsx',
  'HomeRepairsHub.jsx',
  'GardenOutdoorHub.jsx',
  'FurnitureDecorHub.jsx',
  'CleaningHygieneHub.jsx',
];

const basePath = path.join(__dirname, 'pages', 'customer');

for (const file of filesToUpdate) {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Using regex to replace the old card structure
    // We match from `<Link key={service.id}` up to `</Link>`
    const regex = /<Link key=\{service\.id\} to=\{`\/customer\/services\/([^\/]+)\/\$\{service\.id\}`\} className="service-card hover-lift" style=\{\{ '--card-accent': '([^']+)', display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' \}\}>[\s\S]*?<\/Link>/g;
    
    content = content.replace(regex, (match, category, accentColor) => {
      return `<Link key={service.id} to={\`/customer/services/${category}/\${service.id}\`} className="service-card hover-lift" style={{ '--card-accent': '${accentColor}', display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <img src={getServiceImage(service.id)} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '6px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <HiOutlineStar style={{ color: '#f59e0b' }} /> {service.rating}
              </div>
            </div>
            <div className="service-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>{t(service.nameKey)}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, minHeight: '40px' }}>{t(service.descKey)}</p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--gray-50)', color: 'var(--gray-600)', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}><HiOutlineClock style={{ color: 'var(--gray-400)' }} /> {service.jobsDone}+ jobs done</span>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}><HiOutlineCurrencyRupee style={{ marginRight: '2px', color: 'var(--gray-500)' }} />{service.basePrice}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', background: 'var(--card-accent)', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' }}>Book now →</span>
              </div>
            </div>
          </Link>`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

// CategoryHub has a slightly different Link structure because category is dynamic
const categoryHubPath = path.join(basePath, 'CategoryHub.jsx');
if (fs.existsSync(categoryHubPath)) {
  let content = fs.readFileSync(categoryHubPath, 'utf8');
  const regex = /<Link\s*key=\{service\.id\}\s*to=\{`\/customer\/services\/\$\{category\}\/\$\{service\.id\}`\}\s*className="service-card hover-lift"\s*style=\{\{ '--card-accent': meta\.color, display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' \}\}\s*>[\s\S]*?<\/Link>/g;
  
  content = content.replace(regex, `<Link
              key={service.id}
              to={\`/customer/services/\${category}/\${service.id}\`}
              className="service-card hover-lift"
              style={{ '--card-accent': meta.color, display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--gray-200)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            >
              <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                <img src={getServiceImage(service.id)} alt={t(service.nameKey)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '6px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                  <HiOutlineStar style={{ color: '#f59e0b' }} /> {service.rating}
                </div>
              </div>
              <div className="service-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '8px' }}>{t(service.nameKey)}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5, minHeight: '40px' }}>{t(service.descKey)}</p>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--gray-50)', color: 'var(--gray-600)', padding: '6px 10px', borderRadius: '8px', fontWeight: 600 }}><HiOutlineClock style={{ color: 'var(--gray-400)' }} /> {service.jobsDone}+ jobs done</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed var(--gray-200)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 900, color: 'var(--navy-900)' }}><HiOutlineCurrencyRupee style={{ marginRight: '2px', color: 'var(--gray-500)' }} />{service.basePrice}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', background: 'var(--card-accent)', padding: '10px 18px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s' }}>Book now →</span>
                </div>
              </div>
            </Link>`);
  fs.writeFileSync(categoryHubPath, content, 'utf8');
  console.log('Updated CategoryHub.jsx');
}

// Generate unique image mappings for imageHelpers.js
const registryContent = fs.readFileSync(path.join(__dirname, 'data', 'servicesRegistry.js'), 'utf8');
const matches = [...registryContent.matchAll(/"id":\s*"([^"]+)"/g)].map(m => m[1]);
console.log('Found ' + matches.length + ' services in registry.');

// Random collection of high quality related images covering all sorts of services
const photoIds = [
  'photo-1581578731548-c64695cc6952', 'photo-1584622650111-993a426fbf0a', 'photo-1531482615713-2afd69097998', 'photo-1580674285054-bed31e145f59',
  'photo-1621905251189-08b45d6a269e', 'photo-1621905252507-b35492cc74b4', 'photo-1585704032915-c3400ca199e7', 'photo-1505015920881-0f83c2f7c95e',
  'photo-1562259949-e8e7689d7828', 'photo-1520340356584-f9917d1eea6f', 'photo-1558981806-ec527fa84c39', 'photo-1563720223185-11003d516935',
  'photo-1605810230434-7631ac76ec81', 'photo-1508873535684-277a3cbcc4e8', 'photo-1556911220-e15b29be8c8f', 'photo-1528190336454-13cd56b45b5a',
  'photo-1540518614846-7eded433c457', 'photo-1586023492125-27b2c045efd7', 'photo-1548199973-03cce0bbc87b', 'photo-1534361960057-19889db9621e',
  'photo-1541599540903-216a46ca1dc0', 'photo-1538688525198-9b88f6f53126', 'photo-1585338107529-13afc5f02586', 'photo-1530103862676-de8c9debad1d',
  'photo-1616486338812-3dadae4b4ace', 'photo-1615811361523-6bd03d7748e7', 'photo-1513694203232-719a280e022f', 'photo-1555244162-803834f70033',
  'photo-1544197150-b99a580bb7a8', 'photo-1601584115197-04ecc0da31d7', 'photo-1583847268964-b28dc8f51f92', 'photo-1576765608535-5f04d1e3f289',
  'photo-1560066984-138dadb4c035', 'photo-1449965408869-eaa3f722e40d', 'photo-1524413840807-0c3cb6fa808d', 'photo-1427504494785-3a9ca7044f45',
  'photo-1560518883-ce09059eeffa', 'photo-1504307651254-35680f356dfd', 'photo-1509198397868-475647b2a1e5', 'photo-1463936575829-25148e1db1b8',
  'photo-1592150621744-aca64f48394a', 'photo-1504917595217-d4dc5ebe6122', 'photo-1533090161767-e6ffed986c88', 'photo-1507089947368-19c1da9775ae',
  'photo-1579684385127-1ef15d508118', 'photo-1576091160550-2173dba999ef', 'photo-1579154204601-01588f351e67', 'photo-1516627145497-ae6968895b74',
  'photo-1559839734-2b71ea197ec2', 'photo-1506126613408-eca07ce68773', 'photo-1571019614242-c5c5dee9f50b', 'photo-1502086223501-7ea6ecd79368',
  'photo-1481627834876-b7833e8f5570', 'photo-1600585154340-be6161a56a0c', 'photo-1586528116311-ad8dd3c8310d', 'photo-1619642751034-765dfdf7c58e',
  'photo-1584132967334-10e028bd69f7', 'photo-1470225620780-dba8ba36b745', 'photo-1495707902641-75cac588d2e9', 'photo-1516450360452-9312f5e86fc7',
  'photo-1517245386807-bb43f82c33c4', 'photo-1517677208171-0bc6725a3e60', 'photo-1582735689369-4fe89db7114c', 'photo-1456513080510-7bf3a84b82f8',
  'photo-1555066931-4365d14bab8c', 'photo-1586281380349-632531db7ed4', 'photo-1578985545062-69928b1d9587', 'photo-1490645935967-10de6ba17061',
  'photo-1522069169874-c58ec4b76be5', 'photo-1573497019940-1c28c88b4f3e', 'photo-1505693416388-ac5ce068fe85', 'photo-1556910103-1c02745aae4d',
  'photo-1504674900247-0877df9cc836', 'photo-1490430657723-4d607c1503fc', 'photo-1628155930542-3c7a64e2c833', 'photo-1584622781564-1d987f7333c1',
  'photo-1563223771-5fe4038fbfc9', 'photo-1600585154526-990dced4db0d', 'photo-1585320806297-9794b3e4eeae', 'photo-1549317661-bd32c8ce0db2',
  'photo-1534120247760-c44c3e4a62f1', 'photo-1544816155-12df9643f363', 'photo-1561414927-6d86591d0c4f', 'photo-1606144042614-b2417e99c4e3'
];

let generatedMap = {};
for (let i = 0; i < matches.length; i++) {
  // Ensure uniqueness by picking a photo ID and removing it from the pool if possible, or just cycling if we run out
  // But wait, there are ~84 photos and ~50-80 matches. So we can just map them 1:1.
  const photo = photoIds[i % photoIds.length];
  generatedMap[matches[i]] = photo;
}

const newImageHelpersContent = `export const getServiceImage = (serviceId) => {
  const exactMap = ${JSON.stringify(generatedMap, null, 4)};

  if (exactMap[serviceId]) {
    return \`https://images.unsplash.com/\${exactMap[serviceId]}?auto=format&fit=crop&w=400&q=80\`;
  }

  // Fallback hash mapping
  const fallbacks = [
    'photo-1581578731548-c64695cc6952',
    'photo-1584622650111-993a426fbf0a',
    'photo-1531482615713-2afd69097998',
    'photo-1580674285054-bed31e145f59'
  ];
  const hash = serviceId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return \`https://images.unsplash.com/\${fallbacks[hash % fallbacks.length]}?auto=format&fit=crop&w=400&q=80\`;
};
`;

fs.writeFileSync(path.join(__dirname, 'utils', 'imageHelpers.js'), newImageHelpersContent, 'utf8');
console.log('Updated imageHelpers.js with ' + Object.keys(generatedMap).length + ' unique mappings.');
