export const getServiceImage = (serviceId) => {
  const imageMap = {
    'ac-repair': 'photo-1621905251189-08b45d6a269e',
    'electrician': 'photo-1621905252507-b35492cc74b4',
    'plumb': 'photo-1585704032915-c3400ca199e7',
    'carpent': 'photo-1505015920881-0f83c2f7c95e',
    'paint': 'photo-1562259949-e8e7689d7828',
    'car-wash': 'photo-1520340356584-f9917d1eea6f',
    'bike': 'photo-1558981806-ec527fa84c39',
    'jumpstart': 'photo-1563720223185-11003d516935',
    'dent': 'photo-1605810230434-7631ac76ec81',
    'clean': 'photo-1584622650111-993a426fbf0a',
    'pest': 'photo-1594951474586-17b5e406dfec',
    'decor': 'photo-1513694203232-719a280e022f',
    'cater': 'photo-1555244162-803834f70033',
    'wifi': 'photo-1544197150-b99a580bb7a8',
    'cctv': 'photo-1557683316-973673baf926',
    'doorbell': 'photo-1558002038-1055907df827',
    'elder': 'photo-1576765608535-5f04d1e3f289',
    'beauty': 'photo-1560066984-138dadb4c035',
    'driver': 'photo-1449965408869-eaa3f722e40d',
    'pack': 'photo-1600585154340-be6161a56a0c',
    'tuit': 'photo-1427504494785-3a9ca7044f45',
    'comput': 'photo-1531482615713-2afd69097998',
    'tenant': 'photo-1560518883-ce09059eeffa',
    'inspect': 'photo-1581578731548-c64695cc6952',
    'waterproof': 'photo-1514525253161-7a46d19cd819',
    'diwali': 'photo-1514525253161-7a46d19cd819',
    'furnitur': 'photo-1538688525198-9b88f6f53126',
    'plant': 'photo-1416879598555-33f6a27e1b76',
    'lawn': 'photo-1558904541-efa843a96f0f',
    'weld': 'photo-1504917595217-d4dc5ebe6122',
    'doctor': 'photo-1579684385127-1ef15d508118',
    'physio': 'photo-1576091160550-2173dba999ef',
    'lab': 'photo-1579154204601-01588f351e67',
    'baby': 'photo-1516627145497-ae6968895b74',
    'pet': 'photo-1541599540903-216a46ca1dc0',
    'chef': 'photo-1556910103-1c02745aae4d',
    'tiffin': 'photo-1504674900247-0877df9cc836',
    'airport': 'photo-1436491865332-7a61a3597d2b',
    'security': 'photo-1518063071279-8d8a7071f1d1',
    'geyser': 'photo-1585704032915-c3400ca199e7',
    'locksmith': 'photo-1563223771-5fe4038fbfc9',
    'appliance': 'photo-1584622650111-993a426fbf0a',
    'chimney': 'photo-1584622650111-993a426fbf0a',
    'garden': 'photo-1416879598555-33f6a27e1b76',
    'irrigat': 'photo-1558904541-efa843a96f0f',
    'outdoor': 'photo-1520188740392-802c0b78e357',
    'gate': 'photo-1504917595217-d4dc5ebe6122'
  };

  for (const [key, photoId] of Object.entries(imageMap)) {
    if (serviceId.toLowerCase().includes(key)) {
      return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=400&q=80`;
    }
  }

  const fallbacks = [
    'photo-1581578731548-c64695cc6952',
    'photo-1584622650111-993a426fbf0a',
    'photo-1531482615713-2afd69097998',
    'photo-1580674285054-bed31e145f59'
  ];
  const hash = serviceId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return `https://images.unsplash.com/${fallbacks[hash % fallbacks.length]}?auto=format&fit=crop&w=400&q=80`;
};
