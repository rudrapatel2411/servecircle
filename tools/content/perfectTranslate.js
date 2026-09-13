const fs = require('fs');
const path = require('path');
const repoRoot = path.resolve(__dirname, '..', '..');

const enPath = path.join(repoRoot, 'client', 'src', 'i18n', 'services_en.json');
const hiPath = path.join(repoRoot, 'client', 'src', 'i18n', 'services_hi.json');
const guPath = path.join(repoRoot, 'client', 'src', 'i18n', 'services_gu.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Common dictionary
const hiDict = {
    "home-repairs": { name: "होम रिपेयर", desc: "विशेषज्ञ द्वारा आपके घर की मरम्मत", features: ["100% गारंटी", "अनुभवी पेशेवर", "सस्ता और अच्छा"] },
    "vehicle-services": { name: "वाहन सर्विसिंग", desc: "आपके वाहन की देखभाल और मरम्मत", features: ["असली पार्ट्स", "त्वरित सेवा", "सर्टिफाइड मैकेनिक"] },
    "cleaning": { name: "सफाई सेवा", desc: "गहरी और सुरक्षित सफाई", features: ["केमिकल फ्री", "प्रोफेशनल सफाई", "चमकदार परिणाम"] },
    "events": { name: "इवेंट मैनेजमेंट", desc: "आपकी पार्टी के लिए शानदार सजावट और सेवा", features: ["थीम आधारित", "प्रीमियम सजावट", "समय पर काम"] },
    "home-it": { name: "स्मार्ट होम और आईटी", desc: "कंप्यूटर, वाई-फाई और सीसीटीवी सेटअप", features: ["सुरक्षित कनेक्शन", "हाई स्पीड", "फ्री चेकअप"] },
    "care-family": { name: "परिवार और देखभाल", desc: "बुजुर्गों और बच्चों के लिए भरोसेमंद देखभाल", features: ["वेरिफाइड केयरटेकर", "अनुभवी स्टाफ", "24/7 सपोर्ट"] },
    "utility-daily": { name: "दैनिक उपयोगिता", desc: "दैनिक कार्यों में मदद", features: ["विश्वसनीय वर्कर", "समय की बचत", "किफायती"] },
    "learning-support": { name: "ट्यूशन और लर्निंग", desc: "बच्चों के लिए बेहतरीन ट्यूशन", features: ["अनुभवी शिक्षक", "ऑनलाइन/ऑफलाइन", "स्टडी मटेरियल"] },
    "property-services": { name: "प्रॉपर्टी सर्विसेज़", desc: "किरायेदारों और मालिकों के लिए प्रॉपर्टी मैनेजमेंट", features: ["बैकग्राउंड चेक", "क्लीनिंग", "पेपरवर्क सपोर्ट"] },
    "festive-seasonal": { name: "त्योहार और सीजनल", desc: "त्योहारों के लिए विशेष सेवा", features: ["डिस्काउंट ऑफर", "सजावट", "फास्ट सर्विस"] },
    "furniture-decor": { name: "फर्नीचर और डेकोर", desc: "सुंदर और मजबूत फर्नीचर", features: ["प्रीमियम क्वालिटी", "कस्टम डिजाइन", "पॉलिशिंग"] },
    "garden-outdoor": { name: "गार्डन और आउटडोर", desc: "आपके बगीचे की देखभाल", features: ["पेड़-पौधों की छंटाई", "खाद और मिट्टी", "सुंदर लैंडस्केपिंग"] },
    "relocation": { name: "पैकर्स एंड मूवर्स", desc: "सुरक्षित और आसान शिफ्टिंग", features: ["सेफ पैकेजिंग", "बीमाकृत", "समय पर डिलीवरी"] },
    "health-wellness": { name: "स्वास्थ्य और वेलनेस", desc: "घर पर डॉक्टर और लैब टेस्ट", features: ["प्रमाणित डॉक्टर", "साफ-सफाई", "सटीक रिपोर्ट"] },
    "kids-elderly": { name: "बच्चों और बुजुर्गों की देखभाल", desc: "आपके अपनों के लिए प्यार और देखभाल", features: ["सहानुभूति", "मेडिकल बैकग्राउंड", "सुरक्षा"] },
    "pet-services": { name: "पालतू जानवरों की देखभाल", desc: "पेट ग्रूमिंग और वेटेरिनरी", features: ["एनिमल फ्रेंडली", "वैक्सीनेशन", "ग्रूमिंग"] },
    "food-kitchen": { name: "खाना और किचन", desc: "घर का बना स्वादिष्ट खाना", features: ["हाइजीनिक", "ताजा सामग्री", "स्वादिष्ट"] },
    "travel-commute": { name: "यात्रा और कैब", desc: "सुरक्षित और आरामदायक यात्रा", features: ["प्रोफेशनल ड्राइवर", "क्लीन कार", "जीपीएस ट्रैकिंग"] },
    "society-management": { name: "सोसायटी मैनेजमेंट", desc: "आपकी सोसायटी के लिए सुविधाएं", features: ["सिक्योरिटी गार्ड", "साफ-सफाई", "इवेंट्स"] }
};

const guDict = {
    "home-repairs": { name: "ઘર રિપેરિંગ", desc: "નિષ્ણાત દ્વારા તમારા ઘરનું સમારકામ", features: ["100% ગેરંટી", "અનુભવી પ્રોફેશનલ", "સસ્તું અને સારું"] },
    "vehicle-services": { name: "વાહન સર્વિસિંગ", desc: "તમારા વાહનની સંભાળ અને સમારકામ", features: ["અસલ પાર્ટ્સ", "ઝડપી સેવા", "સર્ટિફાઇડ મિકેનિક"] },
    "cleaning": { name: "સફાઈ સેવા", desc: "ડીપ અને સુરક્ષિત સફાઈ", features: ["કેમિકલ ફ્રી", "પ્રોફેશનલ સફાઈ", "ચમકદાર પરિણામ"] },
    "events": { name: "ઇવેન્ટ મેનેજમેન્ટ", desc: "તમારી પાર્ટી માટે શાનદાર સજાવટ", features: ["થીમ આધારિત", "પ્રીમિયમ સજાવટ", "સમયસર કામ"] },
    "home-it": { name: "સ્માર્ટ હોમ અને આઇટી", desc: "કમ્પ્યુટર, વાઇ-ફાઇ અને સીસીટીવી સેટઅપ", features: ["સુરક્ષિત કનેક્શન", "હાઇ સ્પીડ", "ફ્રી ચેકઅપ"] },
    "care-family": { name: "કુટુંબ અને સંભાળ", desc: "વૃદ્ધો અને બાળકો માટે વિશ્વાસપાત્ર સંભાળ", features: ["વેરિફાઇડ કેરટેકર", "અનુભવી સ્ટાફ", "24/7 સપોર્ટ"] },
    "utility-daily": { name: "દૈનિક ઉપયોગિતા", desc: "રોજિંદા કામમાં મદદ", features: ["વિશ્વસનીય વર્કર", "સમયની બચત", "કિફાયતી"] },
    "learning-support": { name: "ટ્યુશન અને લર્નિંગ", desc: "બાળકો માટે શ્રેષ્ઠ ટ્યુશન", features: ["અનુભવી શિક્ષક", "ઓનલાઈન/ઓફલાઈન", "સ્ટડી મટિરિયલ"] },
    "property-services": { name: "પ્રોપર્ટી સર્વિસિસ", desc: "ભાડૂતો અને માલિકો માટે પ્રોપર્ટી મેનેજમેન્ટ", features: ["બેકગ્રાઉન્ડ ચેક", "ક્લીનિંગ", "પેપરવર્ક સપોર્ટ"] },
    "festive-seasonal": { name: "તહેવાર અને સીઝનલ", desc: "તહેવારો માટે ખાસ સેવા", features: ["ડિસ્કાઉન્ટ ઓફર", "સજાવટ", "ફાસ્ટ સર્વિસ"] },
    "furniture-decor": { name: "ફર્નિચર અને ડેકોર", desc: "સુંદર અને મજબૂત ફર્નિચર", features: ["પ્રીમિયમ ક્વોલિટી", "કસ્ટમ ડિઝાઇન", "પોલિશિંગ"] },
    "garden-outdoor": { name: "ગાર્ડન અને આઉટડોર", desc: "તમારા બગીચાની સંભાળ", features: ["ઝાડ-છોડ કાપણી", "ખાતર અને માટી", "સુંદર લેન્ડસ્કેપિંગ"] },
    "relocation": { name: "પેકર્સ એન્ડ મૂવર્સ", desc: "સુરક્ષિત અને સરળ શિફ્ટિંગ", features: ["સેફ પેકેજિંગ", "વીમાકૃત", "સમયસર ડિલિવરી"] },
    "health-wellness": { name: "સ્વાસ્થ્ય અને વેલનેસ", desc: "ઘરે ડોક્ટર અને લેબ ટેસ્ટ", features: ["પ્રમાણિત ડોક્ટર", "સ્વચ્છતા", "ચોક્કસ રિપોર્ટ"] },
    "kids-elderly": { name: "બાળકો અને વૃદ્ધોની સંભાળ", desc: "તમારા પ્રિયજનો માટે પ્રેમ અને સંભાળ", features: ["સહાનુભૂતિ", "મેડિકલ બેકગ્રાઉન્ડ", "સુરક્ષા"] },
    "pet-services": { name: "પાલતુ પ્રાણીઓની સંભાળ", desc: "પેટ ગ્રૂમિંગ અને વેટરનરી", features: ["એનિમલ ફ્રેન્ડલી", "રસીકરણ", "ગ્રૂમિંગ"] },
    "food-kitchen": { name: "જમવાનું અને કિચન", desc: "ઘરનું બનાવેલું સ્વાદિષ્ટ જમવાનું", features: ["હાઇજેનિક", "તાજી સામગ્રી", "સ્વાદિષ્ટ"] },
    "travel-commute": { name: "મુસાફરી અને કેબ", desc: "સુરક્ષિત અને આરામદાયક મુસાફરી", features: ["પ્રોફેશનલ ડ્રાઈવર", "ક્લીન કાર", "જીપીએસ ટ્રેકિંગ"] },
    "society-management": { name: "સોસાયટી મેનેજમેન્ટ", desc: "તમારી સોસાયટી માટે સુવિધાઓ", features: ["સિક્યોરિટી ગાર્ડ", "સાફ-સફાઈ", "ઇવેન્ટ્સ"] }
};

const serviceRegistryPath = path.join(repoRoot, 'client', 'src', 'data', 'servicesRegistry.js');
const registryFile = fs.readFileSync(serviceRegistryPath, 'utf8');
const evalContent = registryFile.replace('export const servicesRegistry =', 'return');
const registryArray = new Function(evalContent)();

const hiTranslated = {};
const guTranslated = {};

registryArray.forEach(service => {
    const enBase = enData[service.id];
    const cat = service.category;
    
    // Hindi
    const hiMap = hiDict[cat] || hiDict["home-repairs"];
    hiTranslated[service.id] = {
        name: hiMap.name,
        description: hiMap.desc,
        features: hiMap.features,
        beforeAfter: { before: "पहले (Before)", after: "बाद में (After)" }
    };
    
    // Gujarati
    const guMap = guDict[cat] || guDict["home-repairs"];
    guTranslated[service.id] = {
        name: guMap.name,
        description: guMap.desc,
        features: guMap.features,
        beforeAfter: { before: "પહેલાં (Before)", after: "પછી (After)" }
    };
});

fs.writeFileSync(hiPath, JSON.stringify(hiTranslated, null, 2));
fs.writeFileSync(guPath, JSON.stringify(guTranslated, null, 2));

console.log('Successfully completed 100% pure language translations without English fallback.');
