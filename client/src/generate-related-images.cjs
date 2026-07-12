const fs = require('fs');
const path = require('path');

// Dynamically import the registry (using a trick to read it as string and eval it)
const registryContent = fs.readFileSync(path.join(__dirname, 'data', 'servicesRegistry.js'), 'utf8');
const match = registryContent.match(/export const servicesRegistry = (\[[\s\S]*\]);/);
let servicesRegistry = [];
if (match && match[1]) {
  try {
    // Basic eval since it's just an array of objects
    servicesRegistry = eval(match[1]);
  } catch (e) {
    console.error("Eval failed, falling back to regex extraction");
    const idMatches = [...registryContent.matchAll(/"id":\s*"([^"]+)"/g)];
    servicesRegistry = idMatches.map(m => ({ id: m[1], category: '' }));
  }
}

// Group photos by semantic theme
const photoPools = {
  water_clean: [
    '1508873535684-277a3cbcc4e8', '1584622650111-993a426fbf0a', '1556911220-e15b29be8c8f', '1528190336454-13cd56b45b5a', 
    '1540518614846-7eded433c457', '1586023492125-27b2c045efd7', '1520340356584-f9917d1eea6f', '1615811361523-6bd03d7748e7', 
    '1517677208171-0bc6725a3e60', '1582735689369-4fe89db7114c', '1522069169874-c58ec4b76be5', '1561414927-6d86591d0c4f',
    '1585808795552-321356f96ff1', '1527515637462-8f69b8c0db16', '1584622781564-1d987f7333c1', '1584820927503-4f1816e866e4',
    '1590483736622-3985b24d7727', '1604921570775-6f17e3be750b', '1615077464654-e0c46be16fa8', '1576722238423-f3c5b9676648',
    '1586201375761-83865001e8ac', '1583856277259-271d4bf05d41', '1612731114510-745a0b73b5df', '1597500589139-2a95df6c039e'
  ],
  home_repair: [
    '1505015920881-0f83c2f7c95e', '1538688525198-9b88f6f53126', '1621905251189-08b45d6a269e', '1621905252507-b35492cc74b4', 
    '1585704032915-c3400ca199e7', '1562259949-e8e7689d7828', '1583847268964-b28dc8f51f92', '1504307651254-35680f356dfd', 
    '1504917595217-d4dc5ebe6122', '1507089947368-19c1da9775ae', '1563223771-5fe4038fbfc9', '1600585154526-990dced4db0d',
    '1503387762-592deb58ef4e', '1589939705384-5185137a7f0f', '1503437142434-7a32d1f9fb5c', '1572093551061-042854c61986',
    '1611009139191-f8e12d4d9cc2', '1596700685955-5c1cf7be3e2a', '1580983582531-bc6e66cf17f7', '1602492723049-74d150cb8e07'
  ],
  vehicle: [
    '1558981806-ec527fa84c39', '1563720223185-11003d516935', '1605810230434-7631ac76ec81', '1449965408869-eaa3f722e40d', 
    '1524413840807-0c3cb6fa808d', '1560518883-ce09059eeffa', '1600585154340-be6161a56a0c', '1586528116311-ad8dd3c8310d', 
    '1619642751034-765dfdf7c58e', '1549317661-bd32c8ce0db2', '1534120247760-c44c3e4a62f1', '1490430657723-4d607c1503fc',
    '1494976388531-d1058494cdd8', '1502877338535-77390555aa55', '1514316454349-750a4fd6a13c', '1609249769363-22108ed189c4'
  ],
  medical_care: [
    '1576765608535-5f04d1e3f289', '1560066984-138dadb4c035', '1427504494785-3a9ca7044f45', '1579684385127-1ef15d508118', 
    '1576091160550-2173dba999ef', '1579154204601-01588f351e67', '1516627145497-ae6968895b74', '1559839734-2b71ea197ec2', 
    '1506126613408-eca07ce68773', '1571019614242-c5c5dee9f50b', '1502086223501-7ea6ecd79368', '1481627834876-b7833e8f5570', 
    '1456513080510-7bf3a84b82f8', '1555066931-4365d14bab8c', '1586281380349-632531db7ed4', '1490645935967-10de6ba17061', 
    '1573497019940-1c28c88b4f3e', '1505751172876-fa8f81016834', '1511174511562-5aa2e52b2f69', '1584433144859-1fbb045f40f5',
    '1582213782179-e0d53f98f2ca', '1581056797141-8ebaf78bf1c4'
  ],
  events_food: [
    '1530103862676-de8c9debad1d', '1616486338812-3dadae4b4ace', '1513694203232-719a280e022f', '1555244162-803834f70033', 
    '1509198397868-475647b2a1e5', '1470225620780-dba8ba36b745', '1495707902641-75cac588d2e9', '1516450360452-9312f5e86fc7', 
    '1517245386807-bb43f82c33c4', '1578985545062-69928b1d9587', '1505693416388-ac5ce068fe85', '1544816155-12df9643f363', 
    '1556910103-1c02745aae4d', '1504674900247-0877df9cc836', '1511690655006-25f0524483a9', '1414235077428-971145534446',
    '1504113888839-8c888ee27eec', '1478144592103-25e218a04891', '1520201163981-8cc95007dd2a', '1513151233558-d860c5398176'
  ],
  outdoor_tech: [
    '1463936575829-25148e1db1b8', '1592150621744-aca64f48394a', '1533090161767-e6ffed986c88', '1585320806297-9794b3e4eeae', 
    '1585338107529-13afc5f02586', '1544197150-b99a580bb7a8', '1601584115197-04ecc0da31d7', '1531482615713-2afd69097998', 
    '1606144042614-b2417e99c4e3', '1470229722913-7c0e2dbbafd3', '1416879598556-9d628880e6c5', '1518770660439-4636190af475',
    '1524247108137-732e0e64366b', '1497366216548-37526070297c', '1581092921461-eab62e97a780'
  ],
  pets_misc: [
    '1548199973-03cce0bbc87b', '1534361960057-19889db9621e', '1541599540903-216a46ca1dc0', '1584132967334-10e028bd69f7', 
    '1628155930542-3c7a64e2c833', '1580674285054-bed31e145f59', '1501386761578-eac5c94b800a', '1537151608805-ea8124230239', 
    '1526040854-47b19280d0d2', '1497211419994-14ae40a3c7a3', '1517849845537-4d2596bc47ea', '1554692928-ce6ee49704da',
    '1543852786-1cf6624b9987', '1548247659-4faee753b890'
  ]
};

const generatedMap = {};

// Helper to grab a photo and remove it from the pool to guarantee uniqueness
const popPhoto = (poolName) => {
  if (photoPools[poolName] && photoPools[poolName].length > 0) {
    return photoPools[poolName].shift();
  }
  // Fallback to finding any available photo
  for (const pool in photoPools) {
    if (photoPools[pool].length > 0) {
      return photoPools[pool].shift();
    }
  }
  return '1581578731548-c64695cc6952'; // Absolute fallback
};

for (const service of servicesRegistry) {
  const sId = service.id.toLowerCase();
  const cat = (service.category || '').toLowerCase();
  
  let pool = 'pets_misc';
  
  if (sId.includes('clean') || sId.includes('water') || sId.includes('wash') || sId.includes('pest') || sId.includes('tank')) {
    pool = 'water_clean';
  } else if (sId.includes('repair') || sId.includes('electric') || sId.includes('plumb') || sId.includes('carpent') || sId.includes('paint') || cat.includes('repair') || sId.includes('install')) {
    pool = 'home_repair';
  } else if (cat.includes('vehicle') || sId.includes('car') || sId.includes('bike') || sId.includes('transit') || sId.includes('transport') || sId.includes('shifting')) {
    pool = 'vehicle';
  } else if (cat.includes('health') || cat.includes('care') || sId.includes('doctor') || sId.includes('physio') || sId.includes('baby') || sId.includes('beauty') || sId.includes('makeup')) {
    pool = 'medical_care';
  } else if (cat.includes('food') || cat.includes('event') || sId.includes('chef') || sId.includes('cake') || sId.includes('cater') || sId.includes('dj') || sId.includes('decor')) {
    pool = 'events_food';
  } else if (cat.includes('garden') || sId.includes('lawn') || sId.includes('plant') || cat.includes('tech') || sId.includes('tv') || sId.includes('wifi') || sId.includes('cctv')) {
    pool = 'outdoor_tech';
  } else if (cat.includes('pet')) {
    pool = 'pets_misc';
  } else {
    // try to guess by category
    if (cat.includes('clean')) pool = 'water_clean';
    if (cat.includes('reloc')) pool = 'vehicle';
    if (cat.includes('learn')) pool = 'medical_care'; // tutors
    if (cat.includes('furn')) pool = 'home_repair';
  }
  
  generatedMap[service.id] = 'photo-' + popPhoto(pool);
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
console.log('Updated imageHelpers.js with ' + Object.keys(generatedMap).length + ' unique semantic mappings.');
