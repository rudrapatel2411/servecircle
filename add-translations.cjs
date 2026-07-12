const fs = require('fs');

const translations = {
  societyManagement: {
    backToDirectory: 'Back to Directory',
    title: 'ServeCircle Society & RWA Portals 🤝',
    subtitle: 'Exclusive maintenance, security, and cleaning solutions designed for residential societies with heavy group discounts.',
    liveStaffTracker: 'Live Staff Tracker',
    sunita: 'Sunita (Housemaid)',
    enteredAt: 'Entered at 8:15 AM',
    inside: 'Inside',
    rajesh: 'Rajesh (Car Cleaner)',
    lastSeen: 'Last seen yesterday 9:30 AM',
    outside: 'Outside',
    coreServices: 'Core Society Services',
    discountedRates: 'Discounted Group Rates Applied',
    rwaCleanups: 'RWA Collective Cleanups',
    rwaCleanupsDesc: 'Book shared park cleanup, lift lobby pressure washing, or boundary wall paint touch-ups. Join with neighbors for discounts!',
    oneHomeOff: '1 Home = 5% Off',
    twentyFiveHomes: '25 Homes =',
    twentyOff: '20% Off',
    startGroupBooking: 'Start Group Booking',
    bioGuard: 'Biometric Guard Roster',
    bioGuardDesc: 'Deploy fully vetted, biometric-logged security personnel for gates and apartment blocks. Military veterans available.',
    shift12: '12-hour daily shifts',
    monthlyDeploy: 'Monthly full deployment',
    fireSafety: 'Fire safety drill certified',
    deployGuards: 'Deploy Guards',
    b2bContracts: 'Society B2B Contracts',
    b2bContractsDesc: 'Comprehensive monthly or quarterly maintenance contracts designed for the entire society campus.',
    pestControl: 'Pest Control',
    gardenMaint: 'Garden Maintenance',
    lobbyCleaning: 'Lobby Cleaning',
    viewContracts: 'View Contracts',
    customPackages: 'Customized Packages',
    customPackagesDesc: "Tailor-made service bundles based on your society's size. Enjoy scalable pricing and priority support.",
    smallGroup: 'Small: 5+ Homes',
    mediumGroup: 'Medium: 10+ Homes',
    megaGroup: 'Mega: 15+ Homes',
    explorePackages: 'Explore Packages',
    premiumExperiences: 'Premium Society Experiences',
    yoga: 'Community Yoga & Zumba',
    yogaDesc: 'Hire a professional fitness instructor to come to your society park. Split costs with neighbors.',
    bookInstructor: 'Book Instructor',
    evCharger: 'EV Charger Installation',
    evChargerDesc: 'Hassle-free Electric Vehicle charger setup at your personal parking spot with RWA NOC included.',
    reqInstall: 'Request Installation',
    waterWash: 'Waterless Car Wash',
    waterWashDesc: 'Eco-friendly, RWA-approved daily car cleaning subscription right in your parking spot.',
    setupSub: 'Setup Subscription'
  }
};

const hindiTranslations = {
  societyManagement: {
    backToDirectory: 'निर्देशिका पर वापस जाएं',
    title: 'ServeCircle सोसायटी और RWA पोर्टल 🤝',
    subtitle: 'आवासीय सोसायटियों के लिए विशेष रखरखाव, सुरक्षा और सफाई समाधान, भारी ग्रुप छूट के साथ।',
    liveStaffTracker: 'लाइव स्टाफ ट्रैकर',
    sunita: 'सुनीता (घरेलू सहायिका)',
    enteredAt: 'सुबह 8:15 बजे प्रवेश किया',
    inside: 'अंदर',
    rajesh: 'राजेश (कार क्लीनर)',
    lastSeen: 'आखिरी बार कल सुबह 9:30 बजे देखा गया',
    outside: 'बाहर',
    coreServices: 'मुख्य सोसायटी सेवाएँ',
    discountedRates: 'छूट वाले ग्रुप रेट लागू',
    rwaCleanups: 'RWA सामूहिक सफाई',
    rwaCleanupsDesc: 'साझा पार्क की सफाई, लिफ्ट लॉबी प्रेशर वॉशिंग या बाउंड्री वॉल पेंट टच-अप बुक करें। छूट के लिए पड़ोसियों के साथ जुड़ें!',
    oneHomeOff: '1 घर = 5% छूट',
    twentyFiveHomes: '25 घर =',
    twentyOff: '20% छूट',
    startGroupBooking: 'ग्रुप बुकिंग शुरू करें',
    bioGuard: 'बायोमेट्रिक गार्ड रोस्टर',
    bioGuardDesc: 'गेट्स और अपार्टमेंट ब्लॉक के लिए पूरी तरह से जांचे गए, बायोमेट्रिक-लॉग वाले सुरक्षाकर्मियों को तैनात करें। सैन्य दिग्गज उपलब्ध हैं।',
    shift12: '12 घंटे की दैनिक शिफ्ट',
    monthlyDeploy: 'मासिक पूर्ण तैनाती',
    fireSafety: 'फायर सेफ्टी ड्रिल प्रमाणित',
    deployGuards: 'गार्ड तैनात करें',
    b2bContracts: 'सोसायटी B2B अनुबंध',
    b2bContractsDesc: 'पूरे सोसायटी परिसर के लिए डिज़ाइन किए गए व्यापक मासिक या त्रैमासिक रखरखाव अनुबंध।',
    pestControl: 'कीट नियंत्रण',
    gardenMaint: 'बगीचे का रखरखाव',
    lobbyCleaning: 'लॉबी की सफाई',
    viewContracts: 'अनुबंध देखें',
    customPackages: 'कस्टमाइज़्ड पैकेज',
    customPackagesDesc: 'आपकी सोसायटी के आकार के आधार पर दर्जी-निर्मित सेवा बंडल। स्केलेबल मूल्य निर्धारण और प्राथमिकता समर्थन का आनंद लें।',
    smallGroup: 'छोटा: 5+ घर',
    mediumGroup: 'मध्यम: 10+ घर',
    megaGroup: 'मेगा: 15+ घर',
    explorePackages: 'पैकेज एक्सप्लोर करें',
    premiumExperiences: 'प्रीमियम सोसायटी अनुभव',
    yoga: 'सामुदायिक योग और ज़ुम्बा',
    yogaDesc: 'अपने सोसायटी पार्क में आने के लिए एक पेशेवर फिटनेस प्रशिक्षक को किराए पर लें। पड़ोसियों के साथ लागत साझा करें।',
    bookInstructor: 'प्रशिक्षक बुक करें',
    evCharger: 'EV चार्जर इंस्टालेशन',
    evChargerDesc: 'RWA NOC के साथ आपके व्यक्तिगत पार्किंग स्थल पर परेशानी मुक्त इलेक्ट्रिक वाहन चार्जर सेटअप।',
    reqInstall: 'इंस्टालेशन का अनुरोध करें',
    waterWash: 'वाटरलेस कार वॉश',
    waterWashDesc: 'आपके पार्किंग स्थल पर ही पर्यावरण के अनुकूल, RWA-अनुमोदित दैनिक कार सफाई सदस्यता।',
    setupSub: 'सदस्यता सेटअप करें'
  }
};

const gujTranslations = {
  societyManagement: {
    backToDirectory: 'ડિરેક્ટરી પર પાછા જાઓ',
    title: 'ServeCircle સોસાયટી અને RWA પોર્ટલ 🤝',
    subtitle: 'રહેણાંક સોસાયટીઓ માટે વિશિષ્ટ જાળવણી, સુરક્ષા અને સફાઈ ઉકેલો, ભારે ગ્રુપ ડિસ્કાઉન્ટ સાથે.',
    liveStaffTracker: 'લાઇવ સ્ટાફ ટ્રેકર',
    sunita: 'સુનિતા (ઘરકામવાળી)',
    enteredAt: 'સવારે 8:15 વાગ્યે પ્રવેશ કર્યો',
    inside: 'અંદર',
    rajesh: 'રાજેશ (કાર ક્લીનર)',
    lastSeen: 'છેલ્લે ગઈકાલે સવારે 9:30 વાગ્યે જોવા મળ્યો હતો',
    outside: 'બહાર',
    coreServices: 'મુખ્ય સોસાયટી સેવાઓ',
    discountedRates: 'ડિસ્કાઉન્ટેડ ગ્રુપ રેટ્સ લાગુ',
    rwaCleanups: 'RWA સામૂહિક સફાઈ',
    rwaCleanupsDesc: 'શેર કરેલ પાર્કની સફાઈ, લિફ્ટ લોબી પ્રેશર વોશિંગ અથવા બાઉન્ડ્રી વોલ પેઇન્ટ ટચ-અપ્સ બુક કરો. ડિસ્કાઉન્ટ માટે પડોશીઓ સાથે જોડાઓ!',
    oneHomeOff: '1 ઘર = 5% છૂટ',
    twentyFiveHomes: '25 ઘર =',
    twentyOff: '20% છૂટ',
    startGroupBooking: 'ગ્રુપ બુકિંગ શરૂ કરો',
    bioGuard: 'બાયોમેટ્રિક ગાર્ડ રોસ્ટર',
    bioGuardDesc: 'ગેટ્સ અને એપાર્ટમેન્ટ બ્લોક્સ માટે સંપૂર્ણ ચકાસાયેલ, બાયોમેટ્રિક-લોગવાળા સુરક્ષા કર્મચારીઓને તૈનાત કરો. લશ્કરી નિવૃત્ત સૈનિકો ઉપલબ્ધ છે.',
    shift12: '12-કલાકની દૈનિક શિફ્ટ',
    monthlyDeploy: 'માસિક સંપૂર્ણ જમાવટ',
    fireSafety: 'ફાયર સેફ્ટી ડ્રિલ પ્રમાણિત',
    deployGuards: 'ગાર્ડ્સ તૈનાત કરો',
    b2bContracts: 'સોસાયટી B2B કરારો',
    b2bContractsDesc: 'સમગ્ર સોસાયટી કેમ્પસ માટે રચાયેલ વ્યાપક માસિક અથવા ત્રિમાસિક જાળવણી કરાર.',
    pestControl: 'જંતુ નિયંત્રણ',
    gardenMaint: 'બગીચાની જાળવણી',
    lobbyCleaning: 'લોબી સફાઈ',
    viewContracts: 'કરારો જુઓ',
    customPackages: 'કસ્ટમાઇઝ્ડ પેકેજો',
    customPackagesDesc: 'તમારી સોસાયટીના કદના આધારે દરજી-નિર્મિત સર્વિસ બંડલ્સ. સ્કેલેબલ ભાવો અને અગ્રતા આધારનો આનંદ માણો.',
    smallGroup: 'નાનું: 5+ ઘરો',
    mediumGroup: 'મધ્યમ: 10+ ઘરો',
    megaGroup: 'મેગા: 15+ ઘરો',
    explorePackages: 'પેકેજો અન્વેષણ કરો',
    premiumExperiences: 'પ્રીમિયમ સોસાયટી અનુભવો',
    yoga: 'સામુદાયિક યોગ અને ઝુમ્બા',
    yogaDesc: 'તમારા સોસાયટી પાર્કમાં આવવા માટે વ્યાવસાયિક ફિટનેસ પ્રશિક્ષકને હાયર કરો. પડોશીઓ સાથે ખર્ચ વહેંચો.',
    bookInstructor: 'ઇન્સ્ટ્રક્ટર બુક કરો',
    evCharger: 'EV ચાર્જર ઇન્સ્ટોલેશન',
    evChargerDesc: 'RWA NOC સામેલ સાથે તમારા વ્યક્તિગત પાર્કિંગ સ્થળ પર મુશ્કેલી-મુક્ત ઇલેક્ટ્રિક વાહન ચાર્જર સેટઅપ.',
    reqInstall: 'ઇન્સ્ટોલેશનની વિનંતી કરો',
    waterWash: 'વોટરલેસ કાર વોશ',
    waterWashDesc: 'તમારા પાર્કિંગ સ્પોટ પર જ પર્યાવરણને અનુકૂળ, RWA-મંજૂર દૈનિક કાર સફાઈ સબ્સ્ક્રિપ્શન.',
    setupSub: 'સબ્સ્ક્રિપ્શન સેટઅપ કરો'
  }
};

const injectTranslations = (filePath, transObj) => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('societyManagement:')) {
    console.log(`societyManagement already exists in ${filePath}`);
    // Optional: could replace the existing block, but for now just appending is safer if it doesn't exist
    // Let's replace the whole block if it exists just in case
    const keyString = `societyManagement: ${JSON.stringify(transObj.societyManagement, null, 2)},`;
    const regex = /societyManagement:\s*\{[\s\S]*?\},\n/g;
    if(regex.test(content)){
      content = content.replace(regex, keyString + '\n');
    }
  } else {
    const keyString = `societyManagement: ${JSON.stringify(transObj.societyManagement, null, 2)},`;
    content = content.replace(/};\s*export default/, `,\n  ${keyString}\n};\nexport default`);
  }
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
};

injectTranslations('client/src/i18n/en.js', translations);
injectTranslations('client/src/i18n/hi.js', hindiTranslations);
injectTranslations('client/src/i18n/gu.js', gujTranslations);
