const fs = require('fs');

function addTranslations() {
  const enPath = 'client/src/i18n/en.js';
  const hiPath = 'client/src/i18n/hi.js';
  const guPath = 'client/src/i18n/gu.js';

  const newTranslations = {
    en: {
      travelCommuteExt: {
        premiumCommute: "Premium Commute & Rentals",
        luxuryRentals: "Luxury & Vintage Rentals 🏎️",
        luxuryDesc: "Book a high-end luxury car or vintage classic. Options for self-drive or chauffeur.",
        exploreFleet: "Explore Fleet",
        schoolCommute: "School Commute Sub 🚌",
        schoolDesc: "Monthly safe rides for kids with live dashcams and verified drivers.",
        setupRoute: "Setup Kids Route",
        corporateCarpool: "Corporate Carpool Hub 👔",
        corporateDesc: "Share premium daily SUV rides with verified corporate executives on your route.",
        findRiders: "Find Co-riders",
        safetyShield: "ServeCircle Safety Shield™",
        safetyDesc: "24/7 Live Tracking, SOS Button, and Trip Sharing for your peace of mind.",
        liveGps: "Live GPS Monitored",
        gpsDesc: "Every trip is actively monitored from our central control room to ensure you stay on route.",
        shareTrip: "Share Live Trip",
        shareDesc: "Share a live tracking link with your family via WhatsApp so they know exactly where you are.",
        sosAlert: "🚨 SOS Alert"
      },
      petHubExt: {
        healthVault: "Digital Pet Health Vault 📁",
        vaultDesc: "Store vaccination records, prescriptions, and vet notes securely.",
        activeStatus: "Active",
        actionRequired: "Action Required",
        uploadDoc: "Upload Document (PDF, JPG, PNG)",
        antiRabies: "Anti-Rabies Vaccine.pdf",
        annualShot: "Annual DHLPP Shot",
        uploadedOn: "Uploaded: 12 Jan 2026",
        dueIn: "Due in: 14 Days"
      }
    },
    hi: {
      travelCommuteExt: {
        premiumCommute: "प्रीमियम कम्यूट और रेंटल",
        luxuryRentals: "लग्जरी और विंटेज रेंटल 🏎️",
        luxuryDesc: "हाई-एंड लग्जरी कार या विंटेज क्लासिक बुक करें। सेल्फ-ड्राइव या चौफ़र के विकल्प।",
        exploreFleet: "फ़्लीट एक्स्प्लोर करें",
        schoolCommute: "स्कूल कम्यूट सब 🚌",
        schoolDesc: "लाइव डैशकैम और वेरीफाइड ड्राइवर्स के साथ बच्चों के लिए मासिक सुरक्षित सवारी।",
        setupRoute: "किड्स रूट सेटअप करें",
        corporateCarpool: "कॉर्पोरेट कारपूल हब 👔",
        corporateDesc: "अपने रूट पर वेरीफाइड कॉर्पोरेट अधिकारियों के साथ प्रीमियम दैनिक SUV राइड्स शेयर करें।",
        findRiders: "को-राइडर्स खोजें",
        safetyShield: "सर्वसर्कल सेफ्टी शील्ड™",
        safetyDesc: "आपकी मन की शांति के लिए 24/7 लाइव ट्रैकिंग, SOS बटन और ट्रिप शेयरिंग।",
        liveGps: "लाइव GPS मॉनिटर्ड",
        gpsDesc: "यह सुनिश्चित करने के लिए कि आप सही रूट पर रहें, हमारे केंद्रीय नियंत्रण कक्ष से हर यात्रा की सक्रिय रूप से निगरानी की जाती है।",
        shareTrip: "लाइव ट्रिप शेयर करें",
        shareDesc: "व्हाट्सएप के जरिए अपने परिवार के साथ लाइव ट्रैकिंग लिंक शेयर करें ताकि उन्हें पता चले कि आप कहां हैं।",
        sosAlert: "🚨 SOS अलर्ट"
      },
      petHubExt: {
        healthVault: "डिजिटल पेट हेल्थ वॉल्ट 📁",
        vaultDesc: "टीकाकरण रिकॉर्ड, नुस्खे और पशु चिकित्सक के नोट्स सुरक्षित रूप से स्टोर करें।",
        activeStatus: "एक्टिव",
        actionRequired: "कार्रवाई की आवश्यकता",
        uploadDoc: "दस्तावेज़ अपलोड करें (PDF, JPG, PNG)",
        antiRabies: "एंटी-रेबीज वैक्सीन.pdf",
        annualShot: "वार्षिक DHLPP शॉट",
        uploadedOn: "अपलोड किया गया: 12 जनवरी 2026",
        dueIn: "देय: 14 दिनों में"
      }
    },
    gu: {
      travelCommuteExt: {
        premiumCommute: "પ્રીમિયમ કમ્યુટ અને રેન્ટલ્સ",
        luxuryRentals: "લક્ઝરી અને વિન્ટેજ રેન્ટલ્સ 🏎️",
        luxuryDesc: "હાઈ-એન્ડ લક્ઝરી કાર અથવા વિન્ટેજ ક્લાસિક બુક કરો. સેલ્ફ-ડ્રાઈવ અથવા ડ્રાઈવર માટેના વિકલ્પો.",
        exploreFleet: "ફ્લીટનું અન્વેષણ કરો",
        schoolCommute: "સ્કૂલ કમ્યુટ સબ 🚌",
        schoolDesc: "લાઈવ ડેશકેમ્સ અને વેરિફાઈડ ડ્રાઈવરો સાથે બાળકો માટે માસિક સુરક્ષિત રાઈડ્સ.",
        setupRoute: "કિડ્સ રૂટ સેટઅપ કરો",
        corporateCarpool: "કોર્પોરેટ કારપૂલ હબ 👔",
        corporateDesc: "તમારા રૂટ પર વેરિફાઈડ કોર્પોરેટ અધિકારીઓ સાથે પ્રીમિયમ દૈનિક SUV રાઈડ્સ શેર કરો.",
        findRiders: "કો-રાઈડર્સ શોધો",
        safetyShield: "સર્વસર્કલ સેફ્ટી શિલ્ડ™",
        safetyDesc: "તમારી માનસિક શાંતિ માટે 24/7 લાઈવ ટ્રેકિંગ, SOS બટન અને ટ્રિપ શેરિંગ.",
        liveGps: "લાઈવ GPS મોનિટર્ડ",
        gpsDesc: "તમે સાચા રૂટ પર રહો તે સુનિશ્ચિત કરવા માટે દરેક ટ્રિપની અમારા કેન્દ્રીય નિયંત્રણ રૂમમાંથી સક્રિયપણે દેખરેખ રાખવામાં આવે છે.",
        shareTrip: "લાઈવ ટ્રિપ શેર કરો",
        shareDesc: "વોટ્સએપ દ્વારા તમારા પરિવાર સાથે લાઈવ ટ્રેકિંગ લિંક શેર કરો જેથી તેઓને ખબર પડે કે તમે બરાબર ક્યાં છો.",
        sosAlert: "🚨 SOS એલર્ટ"
      },
      petHubExt: {
        healthVault: "ડિજિટલ પેટ હેલ્થ વોલ્ટ 📁",
        vaultDesc: "રસીકરણ રેકોર્ડ્સ, પ્રિસ્ક્રિપ્શન્સ અને પશુચિકિત્સકની નોંધો સુરક્ષિત રીતે સંગ્રહિત કરો.",
        activeStatus: "સક્રિય",
        actionRequired: "કાર્યવાહી જરૂરી",
        uploadDoc: "દસ્તાવેજ અપલોડ કરો (PDF, JPG, PNG)",
        antiRabies: "એન્ટી-રેબીઝ રસી.pdf",
        annualShot: "વાર્ષિક DHLPP શોટ",
        uploadedOn: "અપલોડ કરેલ: 12 જાન્યુઆરી 2026",
        dueIn: "બાકી: 14 દિવસમાં"
      }
    }
  };

  const inject = (filePath, transObj) => {
    let content = fs.readFileSync(filePath, 'utf8');
    const tStr = `
  travelCommuteExt: ${JSON.stringify(transObj.travelCommuteExt, null, 4)},
  petHubExt: ${JSON.stringify(transObj.petHubExt, null, 4)}`;
    
    // Inject just before export default
    content = content.replace(/};\s*export default/, `,\n${tStr}\n};\nexport default`);
    fs.writeFileSync(filePath, content);
  };

  inject(enPath, newTranslations.en);
  inject(hiPath, newTranslations.hi);
  inject(guPath, newTranslations.gu);

  console.log('Injected translations to i18n files.');
}

function patchTravelCommute() {
  const path = 'client/src/pages/customer/TravelCommuteHub.jsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/>Premium Commute & Rentals</g, ">{t('travelCommuteExt.premiumCommute')}<");
  content = content.replace(/Luxury & Vintage Rentals 🏎️/g, "{t('travelCommuteExt.luxuryRentals')}");
  content = content.replace(/Book a high-end luxury car or vintage classic\. Options for self-drive or chauffeur\./g, "{t('travelCommuteExt.luxuryDesc')}");
  content = content.replace(/>Explore Fleet</g, ">{t('travelCommuteExt.exploreFleet')}<");
  
  content = content.replace(/School Commute Sub 🚌/g, "{t('travelCommuteExt.schoolCommute')}");
  content = content.replace(/Monthly safe rides for kids with live dashcams and verified drivers\./g, "{t('travelCommuteExt.schoolDesc')}");
  content = content.replace(/>Setup Kids Route</g, ">{t('travelCommuteExt.setupRoute')}<");

  content = content.replace(/Corporate Carpool Hub 👔/g, "{t('travelCommuteExt.corporateCarpool')}");
  content = content.replace(/Share premium daily SUV rides with verified corporate executives on your route\./g, "{t('travelCommuteExt.corporateDesc')}");
  content = content.replace(/>Find Co-riders</g, ">{t('travelCommuteExt.findRiders')}<");

  content = content.replace(/ServeCircle Safety Shield™/g, "{t('travelCommuteExt.safetyShield')}");
  content = content.replace(/24\/7 Live Tracking, SOS Button, and Trip Sharing for your peace of mind\./g, "{t('travelCommuteExt.safetyDesc')}");
  content = content.replace(/🚨 SOS Alert/g, "{t('travelCommuteExt.sosAlert')}");

  content = content.replace(/Live GPS Monitored/g, "{t('travelCommuteExt.liveGps')}");
  content = content.replace(/Every trip is actively monitored from our central control room to ensure you stay on route\./g, "{t('travelCommuteExt.gpsDesc')}");

  content = content.replace(/Share Live Trip/g, "{t('travelCommuteExt.shareTrip')}");
  content = content.replace(/Share a live tracking link with your family via WhatsApp so they know exactly where you are\./g, "{t('travelCommuteExt.shareDesc')}");

  fs.writeFileSync(path, content);
  console.log('Patched TravelCommuteHub.jsx');
}

function patchPetHub() {
  const path = 'client/src/pages/customer/PetHub.jsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/Digital Pet Health Vault 📁/g, "{t('petHubExt.healthVault')}");
  content = content.replace(/Store vaccination records, prescriptions, and vet notes securely\./g, "{t('petHubExt.vaultDesc')}");
  content = content.replace(/>Active</g, ">{t('petHubExt.activeStatus')}<");
  content = content.replace(/>Action Required</g, ">{t('petHubExt.actionRequired')}<");
  content = content.replace(/Upload Document \(PDF, JPG, PNG\)/g, "{t('petHubExt.uploadDoc')}");
  
  content = content.replace(/Anti-Rabies Vaccine\.pdf/g, "{t('petHubExt.antiRabies')}");
  content = content.replace(/Annual DHLPP Shot/g, "{t('petHubExt.annualShot')}");
  content = content.replace(/Uploaded: 12 Jan 2026/g, "{t('petHubExt.uploadedOn')}");
  content = content.replace(/Due in: 14 Days/g, "{t('petHubExt.dueIn')}");

  fs.writeFileSync(path, content);
  console.log('Patched PetHub.jsx');
}

addTranslations();
patchTravelCommute();
patchPetHub();
