const fs = require('fs');

const path = 'client/src/pages/customer/SocietyPremiumFlow.jsx';
let code = fs.readFileSync(path, 'utf8');

const newCoreServicesData = `
  const coreServicesData = {
    cleanups: [
      { id: 'c1', title: t('coreServices.cleanups.c1.title', 'Park & Garden Deep Clean'), price: '₹1,999', desc: t('coreServices.cleanups.c1.desc', 'Thorough cleaning of common parks, kids play area, and benches.') },
      { id: 'c2', title: t('coreServices.cleanups.c2.title', 'Lift Lobbies Pressure Washing'), price: '₹1,499', desc: t('coreServices.cleanups.c2.desc', 'High-pressure wash for ground floor and basement lift lobbies.') },
      { id: 'c3', title: t('coreServices.cleanups.c3.title', 'Boundary Wall Touch-ups'), price: '₹2,999', desc: t('coreServices.cleanups.c3.desc', 'Scraping and painting of society exterior boundary walls.') }
    ],
    guards: [
      { id: 'g1', title: t('coreServices.guards.g1.title', 'Standard Security Guard'), price: '₹21,999/mo', desc: t('coreServices.guards.g1.desc', '12-hour shift, trained for gate management and visitor entry.') },
      { id: 'g2', title: t('coreServices.guards.g2.title', 'Military Veteran Guard'), price: '₹28,999/mo', desc: t('coreServices.guards.g2.desc', 'Highly disciplined ex-military personnel for strict security.') },
      { id: 'g3', title: t('coreServices.guards.g3.title', 'Fire Safety Certified Guard'), price: '₹24,999/mo', desc: t('coreServices.guards.g3.desc', 'Trained in emergency evacuation and fire extinguisher usage.') }
    ],
    contracts: [
      { id: 'co1', title: t('coreServices.contracts.co1.title', 'Society Pest Control'), price: '₹4,999/mo', desc: t('coreServices.contracts.co1.desc', 'Monthly fogging and pest control for all common areas.') },
      { id: 'co2', title: t('coreServices.contracts.co2.title', 'Garden Maintenance'), price: '₹8,999/mo', desc: t('coreServices.contracts.co2.desc', 'Weekly lawn mowing, trimming, and plant care by professionals.') },
      { id: 'co3', title: t('coreServices.contracts.co3.title', 'Lobby & Corridors Cleaning'), price: '₹12,999/mo', desc: t('coreServices.contracts.co3.desc', 'Daily sweeping and mopping of all floor corridors.') }
    ],
    packages: [
      { id: 'p1', title: t('coreServices.packages.p1.title', 'Small Society (5-20 Homes)'), price: '₹14,999/mo', desc: t('coreServices.packages.p1.desc', 'Basic cleaning and 1 guard for small independent floors.') },
      { id: 'p2', title: t('coreServices.packages.p2.title', 'Medium Society (21-50 Homes)'), price: '₹29,999/mo', desc: t('coreServices.packages.p2.desc', '2 guards, daily cleaning, and weekly garden maintenance.') },
      { id: 'p3', title: t('coreServices.packages.p3.title', 'Mega Society (50+ Homes)'), price: '₹49,999/mo', desc: t('coreServices.packages.p3.desc', '24/7 security, daily deep clean, pest control, and manager.') }
    ]
  };
`;

// Replace the old block
code = code.replace(/const coreServicesData = \{[\s\S]*?\]\s*\};\s*/, newCoreServicesData.trim() + '\n\n  ');
fs.writeFileSync(path, code);


const translations = {
  coreServices: {
    cleanups: {
      c1: { title: 'Park & Garden Deep Clean', desc: 'Thorough cleaning of common parks, kids play area, and benches.' },
      c2: { title: 'Lift Lobbies Pressure Washing', desc: 'High-pressure wash for ground floor and basement lift lobbies.' },
      c3: { title: 'Boundary Wall Touch-ups', desc: 'Scraping and painting of society exterior boundary walls.' }
    },
    guards: {
      g1: { title: 'Standard Security Guard', desc: '12-hour shift, trained for gate management and visitor entry.' },
      g2: { title: 'Military Veteran Guard', desc: 'Highly disciplined ex-military personnel for strict security.' },
      g3: { title: 'Fire Safety Certified Guard', desc: 'Trained in emergency evacuation and fire extinguisher usage.' }
    },
    contracts: {
      co1: { title: 'Society Pest Control', desc: 'Monthly fogging and pest control for all common areas.' },
      co2: { title: 'Garden Maintenance', desc: 'Weekly lawn mowing, trimming, and plant care by professionals.' },
      co3: { title: 'Lobby & Corridors Cleaning', desc: 'Daily sweeping and mopping of all floor corridors.' }
    },
    packages: {
      p1: { title: 'Small Society (5-20 Homes)', desc: 'Basic cleaning and 1 guard for small independent floors.' },
      p2: { title: 'Medium Society (21-50 Homes)', desc: '2 guards, daily cleaning, and weekly garden maintenance.' },
      p3: { title: 'Mega Society (50+ Homes)', desc: '24/7 security, daily deep clean, pest control, and manager.' }
    }
  }
};

const hindiTranslations = {
  coreServices: {
    cleanups: {
      c1: { title: 'पार्क और गार्डन डीप क्लीन', desc: 'सामान्य पार्कों, बच्चों के खेलने के क्षेत्र और बेंचों की पूरी सफाई।' },
      c2: { title: 'लिफ्ट लॉबी प्रेशर वॉशिंग', desc: 'ग्राउंड फ्लोर और बेसमेंट लिफ्ट लॉबी के लिए हाई-प्रेशर वॉश।' },
      c3: { title: 'बाउंड्री वॉल टच-अप्स', desc: 'सोसायटी की बाहरी बाउंड्री वॉल की पेंटिंग और खुरचना।' }
    },
    guards: {
      g1: { title: 'स्टैंडर्ड सुरक्षा गार्ड', desc: '12-घंटे की शिफ्ट, गेट प्रबंधन और आगंतुक प्रवेश के लिए प्रशिक्षित।' },
      g2: { title: 'सैन्य दिग्गज गार्ड', desc: 'सख्त सुरक्षा के लिए अत्यधिक अनुशासित पूर्व सैन्य कर्मी।' },
      g3: { title: 'फायर सेफ्टी सर्टिफाइड गार्ड', desc: 'आपातकालीन निकासी और आग बुझाने के यंत्र के उपयोग में प्रशिक्षित।' }
    },
    contracts: {
      co1: { title: 'सोसायटी कीट नियंत्रण', desc: 'सभी सामान्य क्षेत्रों के लिए मासिक फॉगिंग और कीट नियंत्रण।' },
      co2: { title: 'बगीचे का रखरखाव', desc: 'पेशेवरों द्वारा साप्ताहिक लॉन घास काटना, ट्रिमिंग और पौधों की देखभाल।' },
      co3: { title: 'लॉबी और कॉरिडोर की सफाई', desc: 'सभी फ्लोर कॉरिडोर में दैनिक झाड़ू और पोंछा।' }
    },
    packages: {
      p1: { title: 'छोटी सोसायटी (5-20 घर)', desc: 'छोटे स्वतंत्र मंजिलों के लिए बुनियादी सफाई और 1 गार्ड।' },
      p2: { title: 'मध्यम सोसायटी (21-50 घर)', desc: '2 गार्ड, दैनिक सफाई, और साप्ताहिक उद्यान रखरखाव।' },
      p3: { title: 'मेगा सोसायटी (50+ घर)', desc: '24/7 सुरक्षा, दैनिक डीप क्लीन, कीट नियंत्रण, और प्रबंधक।' }
    }
  }
};

const gujTranslations = {
  coreServices: {
    cleanups: {
      c1: { title: 'પાર્ક અને ગાર્ડન ડીપ ક્લીન', desc: 'સામાન્ય ઉદ્યાનો, બાળકોના રમતના ક્ષેત્ર અને બેન્ચની સંપૂર્ણ સફાઈ.' },
      c2: { title: 'લિફ્ટ લોબી પ્રેશર વોશિંગ', desc: 'ગ્રાઉન્ડ ફ્લોર અને ભોંયરામાં લિફ્ટ લોબી માટે હાઈ-પ્રેશર વોશ.' },
      c3: { title: 'બાઉન્ડ્રી વોલ ટચ-અપ્સ', desc: 'સોસાયટીની બહારની સીમાની દિવાલોનું પેઇન્ટિંગ અને સ્ક્રેપિંગ.' }
    },
    guards: {
      g1: { title: 'સ્ટાન્ડર્ડ સુરક્ષા ગાર્ડ', desc: '12-કલાકની શિફ્ટ, ગેટ મેનેજમેન્ટ અને મુલાકાતીઓના પ્રવેશ માટે તાલીમ પામેલ.' },
      g2: { title: 'લશ્કરી નિવૃત્ત સૈનિક ગાર્ડ', desc: 'કડક સુરક્ષા માટે ઉચ્ચ શિસ્તબદ્ધ ભૂતપૂર્વ લશ્કરી કર્મચારીઓ.' },
      g3: { title: 'ફાયર સેફ્ટી સર્ટિફાઇડ ગાર્ડ', desc: 'કટોકટીમાં સ્થળાંતર અને અગ્નિશામક સાધનોના ઉપયોગ માટે તાલીમ પામેલ.' }
    },
    contracts: {
      co1: { title: 'સોસાયટી જંતુ નિયંત્રણ', desc: 'તમામ સામાન્ય વિસ્તારો માટે માસિક ફોગિંગ અને જંતુ નિયંત્રણ.' },
      co2: { title: 'બગીચાની જાળવણી', desc: 'વ્યાવસાયિકો દ્વારા સાપ્તાહિક ઘાસ કાપવું, ટ્રિમિંગ અને છોડની સંભાળ.' },
      co3: { title: 'લોબી અને કોરિડોરની સફાઈ', desc: 'તમામ ફ્લોર કોરિડોરમાં દૈનિક સાવરણી અને પોતું.' }
    },
    packages: {
      p1: { title: 'નાની સોસાયટી (5-20 ઘરો)', desc: 'નાના સ્વતંત્ર માળ માટે પાયાની સફાઈ અને 1 ગાર્ડ.' },
      p2: { title: 'મધ્યમ સોસાયટી (21-50 ઘરો)', desc: '2 ગાર્ડ્સ, દૈનિક સફાઈ અને સાપ્તાહિક બગીચાની જાળવણી.' },
      p3: { title: 'મેગા સોસાયટી (50+ ઘરો)', desc: '24/7 સુરક્ષા, દૈનિક ડીપ ક્લીન, જંતુ નિયંત્રણ અને મેનેજર.' }
    }
  }
};

const injectTranslations = (filePath, transObj) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const keyString = `coreServices: ${JSON.stringify(transObj.coreServices, null, 2)},`;
  const regex = /coreServices:\s*\{[\s\S]*?\n  \},\n/g;
  if(regex.test(content)){
    content = content.replace(regex, keyString + '\n');
  } else {
    content = content.replace(/};\s*export default/, `,\n  ${keyString}\n};\nexport default`);
  }
  fs.writeFileSync(filePath, content);
};

injectTranslations('client/src/i18n/en.js', translations);
injectTranslations('client/src/i18n/hi.js', hindiTranslations);
injectTranslations('client/src/i18n/gu.js', gujTranslations);
