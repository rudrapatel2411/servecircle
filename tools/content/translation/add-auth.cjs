const fs = require('fs');
const path = require('path');

const authTranslations = {
  en: {
    join: 'Join ServeCircle',
    createAccount: 'Create account',
    setupProfile: 'Set up your profile and get into your panel in one step.',
    fullName: 'Full name',
    enterFullName: 'Enter full name',
    email: 'Email',
    phone: 'Phone',
    tenDigitPhone: '10-digit phone',
    password: 'Password',
    createPassword: 'Create password',
    accountType: 'Account type',
    customer: 'Customer',
    worker: 'Worker',
    admin: 'Admin',
    b2b: 'B2B Partner',
    validationError: 'Name, email, and password are required',
    createAccountBtn: 'Create account',
    alreadyRegistered: 'Already registered? ',
    signIn: 'Sign in',
    whatYouGet: 'What you get',
    benefit1Title: 'Under 30-min Response',
    benefit1Desc: 'Get verified professionals at your doorstep instantly or schedule for later.',
    benefit2Title: 'Secure & Verified',
    benefit2Desc: 'Every service provider undergoes a strict police verification and background check.',
    benefit3Title: 'Community Discounts',
    benefit3Desc: "Join your society's active bookings and unlock up to 30% group discounts."
  },
  hi: {
    join: 'सर्वसर्कल से जुड़ें',
    createAccount: 'खाता बनाएं',
    setupProfile: 'अपना प्रोफ़ाइल सेट करें और एक चरण में अपने पैनल में प्रवेश करें।',
    fullName: 'पूरा नाम',
    enterFullName: 'पूरा नाम दर्ज करें',
    email: 'ईमेल',
    phone: 'फ़ोन',
    tenDigitPhone: '10-अंकीय फ़ोन',
    password: 'पासवर्ड',
    createPassword: 'पासवर्ड बनाएं',
    accountType: 'खाता प्रकार',
    customer: 'ग्राहक',
    worker: 'वर्कर',
    admin: 'व्यवस्थापक',
    b2b: 'B2B पार्टनर',
    validationError: 'नाम, ईमेल और पासवर्ड आवश्यक हैं',
    createAccountBtn: 'खाता बनाएं',
    alreadyRegistered: 'पहले से पंजीकृत हैं? ',
    signIn: 'साइन इन करें',
    whatYouGet: 'आपको क्या मिलता है',
    benefit1Title: '30 मिनट के अंदर प्रतिक्रिया',
    benefit1Desc: 'वेरिफाइड पेशेवरों को तुरंत अपने दरवाजे पर पाएं या बाद के लिए शेड्यूल करें।',
    benefit2Title: 'सुरक्षित और वेरिफाइड',
    benefit2Desc: 'प्रत्येक सेवा प्रदाता का सख्त पुलिस सत्यापन और बैकग्राउंड चेक किया जाता है।',
    benefit3Title: 'सामुदायिक छूट',
    benefit3Desc: 'अपनी सोसायटी की सक्रिय बुकिंग में शामिल हों और 30% तक की छूट पाएं।'
  },
  gu: {
    join: 'સર્વસર્કલ સાથે જોડાઓ',
    createAccount: 'ખાતું બનાવો',
    setupProfile: 'તમારી પ્રોફાઇલ સેટ કરો અને એક પગલામાં તમારા પેનલમાં પ્રવેશ કરો.',
    fullName: 'પૂરું નામ',
    enterFullName: 'પૂરું નામ દાખલ કરો',
    email: 'ઇમેઇલ',
    phone: 'ફોન',
    tenDigitPhone: '10-અંકનો ફોન',
    password: 'પાસવર્ડ',
    createPassword: 'પાસવર્ડ બનાવો',
    accountType: 'ખાતાનો પ્રકાર',
    customer: 'ગ્રાહક',
    worker: 'વર્કર',
    admin: 'એડમિન',
    b2b: 'B2B પાર્ટનર',
    validationError: 'નામ, ઇમેઇલ અને પાસવર્ડ આવશ્યક છે',
    createAccountBtn: 'ખાતું બનાવો',
    alreadyRegistered: 'પહેલેથી જ નોંધાયેલ છો? ',
    signIn: 'સાઇન ઇન કરો',
    whatYouGet: 'તમને શું મળે છે',
    benefit1Title: '30 મિનિટમાં પ્રતિભાવ',
    benefit1Desc: 'ચકાસાયેલ વ્યાવસાયિકોને તરત જ તમારા ઘરે મેળવો અથવા પછી માટે શેડ્યૂલ કરો.',
    benefit2Title: 'સુરક્ષિત અને ચકાસાયેલ',
    benefit2Desc: 'દરેક સેવા પ્રદાતાનું સખત પોલીસ વેરિફિકેશન અને બેકગ્રાઉન્ડ ચેક કરવામાં આવે છે.',
    benefit3Title: 'સામુદાયિક ડિસ્કાઉન્ટ',
    benefit3Desc: 'તમારી સોસાયટીના સક્રિય બુકિંગમાં જોડાઓ અને 30% સુધીનું ડિસ્કાઉન્ટ મેળવો.'
  }
};

const langs = ['en', 'hi', 'gu'];

for (const lang of langs) {
  const filePath = path.join(__dirname, `${lang}.js`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('auth: {')) {
    console.log(`Auth already exists in ${lang}.js`);
    continue;
  }

  const authString = `,\n  auth: ${JSON.stringify(authTranslations[lang], null, 4)}`;
  
  // Find the last closing brace of the main object
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + authString + '\\n' + content.substring(lastBraceIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added auth to ${lang}.js`);
  }
}
