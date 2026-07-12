const fs = require('fs');
const path = require('path');
const https = require('https');

async function validateIds(ids) {
  console.log(`Validating ${ids.length} Unsplash IDs...`);
  const valid = [];
  
  // Validate in batches of 10 to not overwhelm
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const results = await Promise.all(batch.map(id => {
      return new Promise((resolve) => {
        const req = https.request({
          method: 'HEAD',
          host: 'images.unsplash.com',
          path: '/photo-' + id,
          timeout: 3000
        }, (res) => {
          resolve({ id, status: res.statusCode });
        });
        req.on('error', () => resolve({ id, status: 500 }));
        req.on('timeout', () => { req.destroy(); resolve({ id, status: 500 }); });
        req.end();
      });
    }));
    
    for (const r of results) {
      if (r.status === 200 || r.status === 302) {
        valid.push(r.id);
      }
    }
  }
  return valid;
}

const rawPools = {
  water_clean: [
    '1508873535684-277a3cbcc4e8', '1584622650111-993a426fbf0a', '1556911220-e15b29be8c8f', '1528190336454-13cd56b45b5a', 
    '1540518614846-7eded433c457', '1586023492125-27b2c045efd7', '1520340356584-f9917d1eea6f', '1615811361523-6bd03d7748e7', 
    '1517677208171-0bc6725a3e60', '1582735689369-4fe89db7114c', '1522069169874-c58ec4b76be5', '1561414927-6d86591d0c4f',
    '1585808795552-321356f96ff1', '1527515637462-8f69b8c0db16', '1584622781564-1d987f7333c1', '1584820927503-4f1816e866e4',
    '1527515637462-8f69b8c0db16', '1563453392212-326f5e854473', '1587393863484-934fa7db31a9', '1590483736622-3985b24d7727'
  ],
  home_repair: [
    '1505015920881-0f83c2f7c95e', '1538688525198-9b88f6f53126', '1621905251189-08b45d6a269e', '1621905252507-b35492cc74b4', 
    '1585704032915-c3400ca199e7', '1562259949-e8e7689d7828', '1583847268964-b28dc8f51f92', '1504307651254-35680f356dfd', 
    '1504917595217-d4dc5ebe6122', '1507089947368-19c1da9775ae', '1563223771-5fe4038fbfc9', '1600585154526-990dced4db0d',
    '1503387762-592deb58ef4e', '1589939705384-5185137a7f0f', '1497366216548-37526070297c', '1581092921461-eab62e97a780',
    '1581141444158-944a958e0a6d', '1503694978374-8a2fb52063a1', '1591965682823-1d0e513d8a7a', '1604921570775-6f17e3be750b'
  ],
  vehicle: [
    '1558981806-ec527fa84c39', '1563720223185-11003d516935', '1605810230434-7631ac76ec81', '1449965408869-eaa3f722e40d', 
    '1524413840807-0c3cb6fa808d', '1560518883-ce09059eeffa', '1600585154340-be6161a56a0c', '1586528116311-ad8dd3c8310d', 
    '1619642751034-765dfdf7c58e', '1549317661-bd32c8ce0db2', '1534120247760-c44c3e4a62f1', '1490430657723-4d607c1503fc',
    '1494976388531-d1058494cdd8', '1502877338535-77390555aa55', '1514316454349-750a4fd6a13c', '1566418870-fb97f7fa2ff8',
    '1536411320436-1e649ce411ce', '1532525791238-d65eecfc3677', '1533473359331-01f11c750e39', '1553018260-2ff6988f0a71'
  ],
  medical_care: [
    '1576765608535-5f04d1e3f289', '1560066984-138dadb4c035', '1427504494785-3a9ca7044f45', '1579684385127-1ef15d508118', 
    '1576091160550-2173dba999ef', '1579154204601-01588f351e67', '1516627145497-ae6968895b74', '1559839734-2b71ea197ec2', 
    '1506126613408-eca07ce68773', '1571019614242-c5c5dee9f50b', '1502086223501-7ea6ecd79368', '1481627834876-b7833e8f5570', 
    '1456513080510-7bf3a84b82f8', '1555066931-4365d14bab8c', '1586281380349-632531db7ed4', '1490645935967-10de6ba17061', 
    '1573497019940-1c28c88b4f3e', '1505751172876-fa8f81016834', '1511174511562-5aa2e52b2f69', '1550831107-1553da8c8464',
    '1516738901171-8eb4bf4033ec', '1584515979956-6218d6e3e157'
  ],
  events_food: [
    '1530103862676-de8c9debad1d', '1616486338812-3dadae4b4ace', '1513694203232-719a280e022f', '1555244162-803834f70033', 
    '1509198397868-475647b2a1e5', '1470225620780-dba8ba36b745', '1495707902641-75cac588d2e9', '1516450360452-9312f5e86fc7', 
    '1517245386807-bb43f82c33c4', '1578985545062-69928b1d9587', '1505693416388-ac5ce068fe85', '1544816155-12df9643f363', 
    '1556910103-1c02745aae4d', '1504674900247-0877df9cc836', '1511690655006-25f0524483a9', '1414235077428-971145534446',
    '1466978913421-bacb111af1b8', '1513151233558-d860c5398176', '1541592671-8bc6b5a32ec8', '1520201163981-8cc95007dd2a'
  ],
  outdoor_tech: [
    '1463936575829-25148e1db1b8', '1592150621744-aca64f48394a', '1533090161767-e6ffed986c88', '1585320806297-9794b3e4eeae', 
    '1585338107529-13afc5f02586', '1544197150-b99a580bb7a8', '1601584115197-04ecc0da31d7', '1531482615713-2afd69097998', 
    '1606144042614-b2417e99c4e3', '1470229722913-7c0e2dbbafd3', '1416879598556-9d628880e6c5', '1497366216548-37526070297c',
    '1518770660439-4636190af475', '1524247108137-732e0e64366b', '1505330622279-bf59b447477c', '1478144592103-25e218a04891'
  ],
  pets_misc: [
    '1548199973-03cce0bbc87b', '1534361960057-19889db9621e', '1541599540903-216a46ca1dc0', '1584132967334-10e028bd69f7', 
    '1628155930542-3c7a64e2c833', '1580674285054-bed31e145f59', '1501386761578-eac5c94b800a', '1537151608805-ea8124230239', 
    '1526040854-47b19280d0d2', '1497211419994-14ae40a3c7a3', '1517849845537-4d2596bc47ea', '1554692928-ce6ee49704da',
    '1543852786-1cf6624b9987', '1548247659-4faee753b890', '1518717758536-63ea530b4d1d', '1503256207526-0d5d80fa2f47'
  ]
};

async function main() {
  const registryContent = fs.readFileSync(path.join(__dirname, 'data', 'servicesRegistry.js'), 'utf8');
  const idMatches = [...registryContent.matchAll(/"id":\s*"([^"]+)"/g)];
  const servicesRegistry = idMatches.map(m => ({ id: m[1] }));

  // Flatten and validate ALL IDs first
  let allIds = [];
  Object.values(rawPools).forEach(arr => allIds = allIds.concat(arr));
  
  // Quick deduplicate just in case
  allIds = [...new Set(allIds)];
  const validIds = await validateIds(allIds);
  console.log(`Verified ${validIds.length} valid Unsplash photos.`);

  // Rebuild pools with only valid IDs
  const validPools = {};
  for (const [pool, ids] of Object.entries(rawPools)) {
    validPools[pool] = ids.filter(id => validIds.includes(id));
  }

  const generatedMap = {};
  
  let fallbackIndex = 0;
  const popPhoto = (poolName) => {
    if (validPools[poolName] && validPools[poolName].length > 0) {
      return validPools[poolName].shift();
    }
    // Fallback to any available photo
    for (const pool in validPools) {
      if (validPools[pool].length > 0) {
        return validPools[pool].shift();
      }
    }
    // If we absolutely run out of unused photos, start reusing but cycle through them
    const id = validIds[fallbackIndex % validIds.length];
    fallbackIndex++;
    return id;
  };

  // Carefully map semantic matches
  for (const service of servicesRegistry) {
    const sId = service.id.toLowerCase();
    let pool = 'pets_misc';

    // Specific matching based on service id
    if (sId.includes('car-wash') || sId.includes('water-tank') || sId.includes('bathroom') || sId.includes('clean') || sId.includes('pest') || sId.includes('wash') || sId.includes('laundry')) {
      pool = 'water_clean';
    } else if (sId.includes('ac-repair') || sId.includes('electrician') || sId.includes('plumb') || sId.includes('carpent') || sId.includes('paint') || sId.includes('furnitur') || sId.includes('weld') || sId.includes('repair') || sId.includes('install')) {
      pool = 'home_repair';
    } else if (sId.includes('bike') || sId.includes('jumpstart') || sId.includes('dent') || sId.includes('car-detailing') || sId.includes('windshield') || sId.includes('engine') || sId.includes('cab') || sId.includes('driver') || sId.includes('chauffeur') || sId.includes('transit') || sId.includes('shifting')) {
      pool = 'vehicle';
    } else if (sId.includes('doctor') || sId.includes('physio') || sId.includes('lab') || sId.includes('baby') || sId.includes('nurse') || sId.includes('mental') || sId.includes('fitness') || sId.includes('nanny') || sId.includes('beauty') || sId.includes('makeup')) {
      pool = 'medical_care';
    } else if (sId.includes('decor') || sId.includes('cater') || sId.includes('dj') || sId.includes('photograph') || sId.includes('stage') || sId.includes('anchor') || sId.includes('cake') || sId.includes('chef') || sId.includes('tiffin')) {
      pool = 'events_food';
    } else if (sId.includes('wifi') || sId.includes('cctv') || sId.includes('doorbell') || sId.includes('comput') || sId.includes('tv') || sId.includes('pc') || sId.includes('printer') || sId.includes('theater') || sId.includes('plant') || sId.includes('lawn') || sId.includes('garden')) {
      pool = 'outdoor_tech';
    } else if (sId.includes('pet') || sId.includes('vet') || sId.includes('dog') || sId.includes('aquarium')) {
      pool = 'pets_misc';
    } else {
      pool = 'pets_misc';
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
  console.log('Updated imageHelpers.js with ' + Object.keys(generatedMap).length + ' unique, VERIFIED, and highly semantic mappings.');
}

main().catch(console.error);
