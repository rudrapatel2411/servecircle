const fs = require('fs');

const services = [
    'ac-repair', 'electrician-visit', 'plumbing-fix', 'carpenter-visit', 'painter-pro', 'geyser-repair', 'locksmith-pro', 'appliance-install', 'chimney-service', 'water-purifier',
    'car-wash', 'bike-repair', 'battery-jumpstart', 'dent-paint', 'car-detailing', 'bike-puncture', 'windshield-repair', 'engine-coolant',
    'deep-clean', 'sofa-cleaning', 'pest-control', 'water-tank-clean', 'bathroom-deep-clean', 'kitchen-deep-clean', 'fridge-cleaning'
];

const imgPool = {
    'repair': 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=800&q=80',
    'clean': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    'vehicle': 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    'plumb': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    'paint': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    'electric': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    'general': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
};

const beforePool = {
    'repair': 'https://images.unsplash.com/photo-1505015920881-0f83c2f7c95e?auto=format&fit=crop&w=800&q=80',
    'clean': 'https://images.unsplash.com/photo-1594833215918-639a04f9ea4d?auto=format&fit=crop&w=800&q=80',
    'vehicle': 'https://images.unsplash.com/photo-1605557202138-09794bfeb559?auto=format&fit=crop&w=800&q=80',
    'plumb': 'https://images.unsplash.com/photo-1607472586893-edb57cb3b4e1?auto=format&fit=crop&w=800&q=80',
    'paint': 'https://images.unsplash.com/photo-1599696773539-65a8e0cb20ec?auto=format&fit=crop&w=800&q=80',
    'electric': 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&w=800&q=80',
    'general': 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80'
};

let output = `// Auto-generated robust dictionary of high-quality Unsplash images for common services
const customImages = {
  'smart-doorbell': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
`;
let portOutput = `const portfolioImages = {\n`;

services.forEach(id => {
    let type = 'general';
    if(id.includes('repair') || id.includes('carpenter') || id.includes('install')) type = 'repair';
    if(id.includes('clean') || id.includes('wash') || id.includes('pest')) type = 'clean';
    if(id.includes('car') || id.includes('bike') || id.includes('engine')) type = 'vehicle';
    if(id.includes('plumb') || id.includes('water') || id.includes('geyser')) type = 'plumb';
    if(id.includes('paint') || id.includes('dent')) type = 'paint';
    if(id.includes('electric') || id.includes('battery')) type = 'electric';

    output += `  '${id}': '${imgPool[type]}',\n`;
    portOutput += `  '${id}': {\n    before: '${beforePool[type]}',\n    after: '${imgPool[type]}'\n  },\n`;
});

output += `};\n\n${portOutput};\n\n`;
output += `
export const getServiceImage = (serviceId) => {
  if (customImages[serviceId]) {
    return customImages[serviceId];
  }

  const cleanName = serviceId.replace(/-/g, ' ');
  const prompt = \`\${cleanName} service being performed by a professional, highly detailed real life photography\`;
  const encodedPrompt = encodeURIComponent(prompt);
  const hash = Math.abs(serviceId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)) + 42;
  
  return \`https://image.pollinations.ai/prompt/\${encodedPrompt}?width=800&height=400&nologo=true&seed=\${hash}\`;
};

export const getFallbackImage = (serviceId) => {
  if (customImages[serviceId]) return customImages[serviceId];
  // No more placeholders, use a generic high quality splash image
  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
};

export const getPortfolioBeforeImage = (serviceId) => {
  if (portfolioImages[serviceId]?.before) return portfolioImages[serviceId].before;
  return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';
};

export const getPortfolioAfterImage = (serviceId) => {
  if (portfolioImages[serviceId]?.after) return portfolioImages[serviceId].after;
  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
};
`;

fs.writeFileSync('d:/ServeCircle/client/src/utils/imageHelpers.js', output);
console.log('Images seeded!');
