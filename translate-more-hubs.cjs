const fs = require('fs');

function addTranslations() {
  const enPath = 'client/src/i18n/en.js';
  const hiPath = 'client/src/i18n/hi.js';
  const guPath = 'client/src/i18n/gu.js';

  const newTranslations = {
    en: {
      foodKitchenExt: {
        lowCalorie: "Low Calorie (~450 kcal)",
        deliverySchedule: "Delivery Schedule (Tap to Pause)"
      },
      healthWellnessExt: {
        resultsReady: "Your test results are ready!",
        needHelp: "Need help understanding the report?",
        uploadFile: "Upload File",
        uploadDesc: "JPG, PNG or PDF",
        takePhoto: "Take Photo",
        takePhotoDesc: "Use mobile camera",
        medicinesToday: "On all prescribed medicines today!",
        premiumTherapies: "Premium Wellness Therapies",
        ivDrip: "IV Drip Therapy at Home",
        ivDripDesc: "Immunity boosters, Hangover cures, and Vitamin-C drips administered safely by certified nurses at your home.",
        sportsRecovery: "Sports Recovery & Pain Mgmt",
        sportsRecoveryDesc: "Premium Deep Tissue, Cupping Therapy, and Percussion (Theragun) massage specifically for athletes and gym-goers.",
        elderlyCare: "Elderly Care Subscriptions",
        elderlyCareDesc: "Monthly subscription for regular in-home physiotherapy visits to help aging parents with mobility and arthritis pain."
      },
      relocationExt: {
        expPackers: "Experience Packers & Movers 2.0",
        tryAiScanner: "Try our new AI Scanner, Shared Load, and QR Tracking mockups!",
        pickupCity: "Pickup City / Area 📍",
        dropCity: "Drop City / Area 🏁",
        autoFill: "Quick Auto-Fill Inventory 🪄",
        liftAvailable: "Elevator / Lift available? 🛗",
        yesLift: "Yes, Lift Available",
        noLift: "No, Stairs Only (+₹1800)",
        packingService: "Packing Service 📦",
        basicLoading: "Basic Loading",
        premiumBubble: "Premium Bubble Wrap",
        estPrice: "Estimated Price",
        specializedAddons: "Specialized Add-on Services",
        vehicleRelocation: "Vehicle Relocation",
        vehicleRelocationDesc: "Safe and insured intercity transport for your car or bike using specialized carriers with live tracking.",
        petRelocation: "Pet Relocation",
        petRelocationDesc: "Stress-free and safe travel for your furry friends via pet-friendly cabs or domestic air cargo assistance.",
        scrapRemoval: "Scrap & Junk Removal",
        scrapRemovalDesc: "Sell your old furniture or get rid of junk before moving to reduce your shifting volume and save money."
      }
    },
    hi: {
      foodKitchenExt: {
        lowCalorie: "कम कैलोरी (~450 kcal)",
        deliverySchedule: "डिलीवरी शेड्यूल (पॉज़ करने के लिए टैप करें)"
      },
      healthWellnessExt: {
        resultsReady: "आपकी टेस्ट रिपोर्ट तैयार हैं!",
        needHelp: "क्या रिपोर्ट समझने में मदद चाहिए?",
        uploadFile: "फ़ाइल अपलोड करें",
        uploadDesc: "JPG, PNG या PDF",
        takePhoto: "फ़ोटो लें",
        takePhotoDesc: "मोबाइल कैमरा इस्तेमाल करें",
        medicinesToday: "आज सभी निर्धारित दवाओं पर!",
        premiumTherapies: "प्रीमियम वेलनेस थेरेपीज़",
        ivDrip: "घर पर IV ड्रिप थेरेपी",
        ivDripDesc: "प्रमाणित नर्सों द्वारा घर पर सुरक्षित रूप से इम्युनिटी बूस्टर, हैंगओवर क्योर और विटामिन-सी ड्रिप।",
        sportsRecovery: "स्पोर्ट्स रिकवरी और दर्द प्रबंधन",
        sportsRecoveryDesc: "विशेष रूप से एथलीटों के लिए प्रीमियम डीप टिश्यू, कपिंग थेरेपी और पर्कशन (थैरागन) मसाज।",
        elderlyCare: "बुजुर्गों की देखभाल (सब्सक्रिप्शन)",
        elderlyCareDesc: "बुजुर्ग माता-पिता की गतिशीलता और गठिया दर्द में मदद करने के लिए नियमित इन-होम फिजियोथेरेपी।"
      },
      relocationExt: {
        expPackers: "पैकर्स एंड मूवर्स 2.0 का अनुभव करें",
        tryAiScanner: "हमारे नए एआई स्कैनर, शेयर्ड लोड और क्यूआर ट्रैकिंग को आज़माएं!",
        pickupCity: "पिकअप शहर / क्षेत्र 📍",
        dropCity: "ड्रॉप शहर / क्षेत्र 🏁",
        autoFill: "क्विक ऑटो-फिल इन्वेंट्री 🪄",
        liftAvailable: "एलेवेटर / लिफ्ट उपलब्ध है? 🛗",
        yesLift: "हाँ, लिफ्ट उपलब्ध है",
        noLift: "नहीं, सिर्फ सीढ़ियाँ (+₹1800)",
        packingService: "पैकिंग सर्विस 📦",
        basicLoading: "बेसिक लोडिंग",
        premiumBubble: "प्रीमियम बबल रैप",
        estPrice: "अनुमानित कीमत",
        specializedAddons: "विशेष ऐड-ऑन सेवाएं",
        vehicleRelocation: "वाहन स्थानांतरण",
        vehicleRelocationDesc: "लाइव ट्रैकिंग के साथ विशेष कैरियर्स का उपयोग करके आपकी कार या बाइक के लिए सुरक्षित परिवहन।",
        petRelocation: "पेट रिलोकेशन",
        petRelocationDesc: "पेट-फ्रेंडली कैब्स या घरेलू एयर कार्गो सहायता के माध्यम से पालतू जानवरों के लिए तनाव-मुक्त यात्रा।",
        scrapRemoval: "कबाड़ हटाना",
        scrapRemovalDesc: "पुराना फर्नीचर बेचें या शिफ्टिंग वॉल्यूम को कम करने और पैसे बचाने के लिए कबाड़ से छुटकारा पाएं।"
      }
    },
    gu: {
      foodKitchenExt: {
        lowCalorie: "ઓછી કેલરી (~450 kcal)",
        deliverySchedule: "ડિલિવરી શેડ્યૂલ (થોભાવવા માટે ટેપ કરો)"
      },
      healthWellnessExt: {
        resultsReady: "તમારા પરીક્ષણ પરિણામો તૈયાર છે!",
        needHelp: "શું રિપોર્ટ સમજવામાં મદદની જરૂર છે?",
        uploadFile: "ફાઇલ અપલોડ કરો",
        uploadDesc: "JPG, PNG અથવા PDF",
        takePhoto: "ફોટો લો",
        takePhotoDesc: "મોબાઇલ કેમેરાનો ઉપયોગ કરો",
        medicinesToday: "આજે તમામ સૂચિત દવાઓ પર!",
        premiumTherapies: "પ્રીમિયમ વેલનેસ થેરાપીઝ",
        ivDrip: "ઘરે IV ડ્રિપ થેરાપી",
        ivDripDesc: "પ્રમાણિત નર્સો દ્વારા ઘરે સુરક્ષિત રીતે ઇમ્યુનિટી બૂસ્ટર, હેંગઓવર ક્યોર અને વિટામિન-સી ડ્રિપ.",
        sportsRecovery: "સ્પોર્ટ્સ રિકવરી અને પીડા વ્યવસ્થાપન",
        sportsRecoveryDesc: "ખાસ કરીને એથ્લેટ્સ માટે પ્રીમિયમ ડીપ ટિશ્યુ, કપિંગ થેરાપી અને પર્ક્યુશન (થેરાગન) મસાજ.",
        elderlyCare: "વૃદ્ધોની સંભાળ (સબ્સ્ક્રિપ્શન)",
        elderlyCareDesc: "વૃદ્ધ માતા-પિતાની ગતિશીલતા અને સંધિવાનાં દુખાવામાં મદદ કરવા માટે નિયમિત ઇન-હોમ ફિઝિયોથેરાપી."
      },
      relocationExt: {
        expPackers: "પેકર્સ એન્ડ મૂવર્સ 2.0 નો અનુભવ કરો",
        tryAiScanner: "અમારા નવા AI સ્કેનર, શેર્ડ લોડ અને QR ટ્રેકિંગને અજમાવો!",
        pickupCity: "પિકઅપ શહેર / વિસ્તાર 📍",
        dropCity: "ડ્રોપ શહેર / વિસ્તાર 🏁",
        autoFill: "ક્વિક ઓટો-ફિલ ઇન્વેન્ટરી 🪄",
        liftAvailable: "એલિવેટર / લિફ્ટ ઉપલબ્ધ છે? 🛗",
        yesLift: "હા, લિફ્ટ ઉપલબ્ધ છે",
        noLift: "ના, માત્ર સીડીઓ (+₹1800)",
        packingService: "પેકિંગ સર્વિસ 📦",
        basicLoading: "બેઝિક લોડિંગ",
        premiumBubble: "પ્રીમિયમ બબલ રેપ",
        estPrice: "અંદાજિત કિંમત",
        specializedAddons: "વિશેષ એડ-ઓન સેવાઓ",
        vehicleRelocation: "વાહન સ્થળાંતર",
        vehicleRelocationDesc: "લાઇવ ટ્રેકિંગ સાથે વિશેષ કેરિયર્સનો ઉપયોગ કરીને તમારી કાર અથવા બાઇક માટે સુરક્ષિત પરિવહન.",
        petRelocation: "પેટ રિલોકેશન",
        petRelocationDesc: "પેટ-ફ્રેન્ડલી કેબ્સ અથવા ઘરેલુ એર કાર્ગો સહાય દ્વારા પાલતુ પ્રાણીઓ માટે તણાવ-મુક્ત મુસાફરી.",
        scrapRemoval: "ભંગાર દૂર કરવું",
        scrapRemovalDesc: "જૂનું ફર્નિચર વેચો અથવા શિફ્ટિંગ વોલ્યુમ ઘટાડવા અને પૈસા બચાવવા માટે ભંગારથી છુટકારો મેળવો."
      }
    }
  };

  const inject = (filePath, transObj) => {
    let content = fs.readFileSync(filePath, 'utf8');
    const tStr = `
  foodKitchenExt: ${JSON.stringify(transObj.foodKitchenExt, null, 4)},
  healthWellnessExt: ${JSON.stringify(transObj.healthWellnessExt, null, 4)},
  relocationExt: ${JSON.stringify(transObj.relocationExt, null, 4)}`;
    
    // Inject just before export default
    content = content.replace(/};\s*export default/, `,\n${tStr}\n};\nexport default`);
    fs.writeFileSync(filePath, content);
  };

  inject(enPath, newTranslations.en);
  inject(hiPath, newTranslations.hi);
  inject(guPath, newTranslations.gu);

  console.log('Injected translations to i18n files.');
}

function patchFoodKitchen() {
  const path = 'client/src/pages/customer/FoodKitchenHub.jsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/>Low Calorie \(~450 kcal\)</g, ">{t('foodKitchenExt.lowCalorie')}<");
  content = content.replace(/>Delivery Schedule \(Tap to Pause\)</g, ">{t('foodKitchenExt.deliverySchedule')}<");

  fs.writeFileSync(path, content);
  console.log('Patched FoodKitchenHub.jsx');
}

function patchHealthWellness() {
  const path = 'client/src/pages/customer/HealthWellnessHub.jsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/>Your test results are ready!</g, ">{t('healthWellnessExt.resultsReady')}<");
  content = content.replace(/>Need help understanding the report\?</g, ">{t('healthWellnessExt.needHelp')}<");
  content = content.replace(/>Upload File</g, ">{t('healthWellnessExt.uploadFile')}<");
  content = content.replace(/>JPG, PNG or PDF</g, ">{t('healthWellnessExt.uploadDesc')}<");
  content = content.replace(/>Take Photo</g, ">{t('healthWellnessExt.takePhoto')}<");
  content = content.replace(/>Use mobile camera</g, ">{t('healthWellnessExt.takePhotoDesc')}<");
  content = content.replace(/>On all prescribed medicines today!</g, ">{t('healthWellnessExt.medicinesToday')}<");
  content = content.replace(/>Premium Wellness Therapies</g, ">{t('healthWellnessExt.premiumTherapies')}<");
  
  content = content.replace(/>IV Drip Therapy at Home</g, ">{t('healthWellnessExt.ivDrip')}<");
  content = content.replace(/>Immunity boosters, Hangover cures, and Vitamin-C drips administered safely by certified nurses at your home\.</g, ">{t('healthWellnessExt.ivDripDesc')}<");
  content = content.replace(/>Sports Recovery & Pain Mgmt</g, ">{t('healthWellnessExt.sportsRecovery')}<");
  content = content.replace(/>Premium Deep Tissue, Cupping Therapy, and Percussion \(Theragun\) massage specifically for athletes and gym-goers\.</g, ">{t('healthWellnessExt.sportsRecoveryDesc')}<");
  content = content.replace(/>Elderly Care Subscriptions</g, ">{t('healthWellnessExt.elderlyCare')}<");
  content = content.replace(/>Monthly subscription for regular in-home physiotherapy visits to help aging parents with mobility and arthritis pain\.</g, ">{t('healthWellnessExt.elderlyCareDesc')}<");

  fs.writeFileSync(path, content);
  console.log('Patched HealthWellnessHub.jsx');
}

function patchRelocationHub() {
  const path = 'client/src/pages/customer/RelocationHub.jsx';
  let content = fs.readFileSync(path, 'utf8');

  content = content.replace(/Experience Packers & Movers 2\.0/g, "{t('relocationExt.expPackers')}");
  content = content.replace(/>Try our new AI Scanner, Shared Load, and QR Tracking mockups!</g, ">{t('relocationExt.tryAiScanner')}<");
  content = content.replace(/>Pickup City \/ Area 📍</g, ">{t('relocationExt.pickupCity')}<");
  content = content.replace(/>Drop City \/ Area 🏁</g, ">{t('relocationExt.dropCity')}<");
  content = content.replace(/>Quick Auto-Fill Inventory 🪄</g, ">{t('relocationExt.autoFill')}<");
  content = content.replace(/>Elevator \/ Lift available\? 🛗</g, ">{t('relocationExt.liftAvailable')}<");
  
  content = content.replace(/>Yes, Lift Available</g, ">{t('relocationExt.yesLift')}<");
  content = content.replace(/>No, Stairs Only \(\+₹1800\)</g, ">{t('relocationExt.noLift')}<");
  content = content.replace(/>Packing Service 📦</g, ">{t('relocationExt.packingService')}<");
  content = content.replace(/>Basic Loading</g, ">{t('relocationExt.basicLoading')}<");
  content = content.replace(/>Premium Bubble Wrap</g, ">{t('relocationExt.premiumBubble')}<");
  content = content.replace(/>Estimated Price</g, ">{t('relocationExt.estPrice')}<");
  
  content = content.replace(/>Specialized Add-on Services</g, ">{t('relocationExt.specializedAddons')}<");
  content = content.replace(/>Vehicle Relocation</g, ">{t('relocationExt.vehicleRelocation')}<");
  content = content.replace(/>Safe and insured intercity transport for your car or bike using specialized carriers with live tracking\.</g, ">{t('relocationExt.vehicleRelocationDesc')}<");
  content = content.replace(/>Pet Relocation</g, ">{t('relocationExt.petRelocation')}<");
  content = content.replace(/>Stress-free and safe travel for your furry friends via pet-friendly cabs or domestic air cargo assistance\.</g, ">{t('relocationExt.petRelocationDesc')}<");
  content = content.replace(/>Scrap & Junk Removal</g, ">{t('relocationExt.scrapRemoval')}<");
  content = content.replace(/>Sell your old furniture or get rid of junk before moving to reduce your shifting volume and save money\.</g, ">{t('relocationExt.scrapRemovalDesc')}<");

  fs.writeFileSync(path, content);
  console.log('Patched RelocationHub.jsx');
}

addTranslations();
patchFoodKitchen();
patchHealthWellness();
patchRelocationHub();
