const fs = require('fs');
const path = require('path');

const loginTranslations = {
  en: {
    kicker: 'ServeCircle Access',
    title: 'Welcome back',
    subtitle: 'Sign in to access your panel and continue your workflow.',
    email: 'Email',
    password: 'Password',
    enterPassword: 'Enter password',
    selectPanel: 'Select Panel Access',
    roleCustomer: '👤 Customer',
    roleWorker: '👷 Worker',
    roleAdmin: '🛡️ Admin',
    roleB2b: '🏢 B2B Partner',
    validationError: 'Email and password are required',
    continueBtn: 'Continue',
    newHere: 'New here? ',
    createAccount: 'Create account',
    quickAccess: 'Quick panel access',
    customerPanel: 'Customer Panel',
    customerPanelDesc: 'Book services, track jobs, and manage wallet.',
    workerPanel: 'Worker Panel',
    workerPanelDesc: 'Accept jobs, manage schedule, and track earnings.',
    adminPanel: 'Admin Panel',
    adminPanelDesc: 'Operate bookings, analytics, complaints, and partners.',
    b2bPanel: 'B2B Panel',
    b2bPanelDesc: 'Handle contracts, team accounts, and invoices.',
    demoNote: 'Demo mode: navigation is role-based UI access. Authentication APIs can be wired directly later.'
  },
  hi: {
    kicker: 'सर्वसर्कल एक्सेस',
    title: 'वापसी पर स्वागत है',
    subtitle: 'अपने पैनल तक पहुंचने और अपना काम जारी रखने के लिए साइन इन करें।',
    email: 'ईमेल',
    password: 'पासवर्ड',
    enterPassword: 'पासवर्ड दर्ज करें',
    selectPanel: 'पैनल एक्सेस चुनें',
    roleCustomer: '👤 ग्राहक',
    roleWorker: '👷 वर्कर',
    roleAdmin: '🛡️ व्यवस्थापक',
    roleB2b: '🏢 B2B पार्टनर',
    validationError: 'ईमेल और पासवर्ड आवश्यक हैं',
    continueBtn: 'आगे बढ़ें',
    newHere: 'यहां नए हैं? ',
    createAccount: 'खाता बनाएं',
    quickAccess: 'त्वरित पैनल एक्सेस',
    customerPanel: 'ग्राहक पैनल',
    customerPanelDesc: 'सेवाएं बुक करें, जॉब ट्रैक करें, और वॉलेट प्रबंधित करें।',
    workerPanel: 'वर्कर पैनल',
    workerPanelDesc: 'जॉब स्वीकार करें, शेड्यूल प्रबंधित करें, और कमाई ट्रैक करें।',
    adminPanel: 'व्यवस्थापक पैनल',
    adminPanelDesc: 'बुकिंग, एनालिटिक्स, शिकायतें और पार्टनर संचालित करें।',
    b2bPanel: 'B2B पैनल',
    b2bPanelDesc: 'कॉन्ट्रैक्ट, टीम अकाउंट और इनवॉइस हैंडल करें।',
    demoNote: 'डेमो मोड: नेविगेशन रोल-आधारित UI एक्सेस है। प्रमाणीकरण API बाद में जोड़े जा सकते हैं।'
  },
  gu: {
    kicker: 'સર્વસર્કલ ઍક્સેસ',
    title: 'પરત ફરવા પર સ્વાગત છે',
    subtitle: 'તમારી પેનલ ઍક્સેસ કરવા અને તમારું કાર્ય ચાલુ રાખવા માટે સાઇન ઇન કરો.',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    enterPassword: 'પાસવર્ડ દાખલ કરો',
    selectPanel: 'પેનલ ઍક્સેસ પસંદ કરો',
    roleCustomer: '👤 ગ્રાહક',
    roleWorker: '👷 વર્કર',
    roleAdmin: '🛡️ એડમિન',
    roleB2b: '🏢 B2B પાર્ટનર',
    validationError: 'ઇમેઇલ અને પાસવર્ડ આવશ્યક છે',
    continueBtn: 'ચાલુ રાખો',
    newHere: 'અહીં નવા છો? ',
    createAccount: 'ખાતું બનાવો',
    quickAccess: 'ઝડપી પેનલ ઍક્સેસ',
    customerPanel: 'ગ્રાહક પેનલ',
    customerPanelDesc: 'સેવાઓ બુક કરો, જોબ ટ્રેક કરો અને વોલેટ મેનેજ કરો.',
    workerPanel: 'વર્કર પેનલ',
    workerPanelDesc: 'જોબ સ્વીકારો, શેડ્યૂલ મેનેજ કરો અને કમાણી ટ્રેક કરો.',
    adminPanel: 'એડમિન પેનલ',
    adminPanelDesc: 'બુકિંગ, એનાલિટિક્સ, ફરિયાદો અને પાર્ટનર્સનું સંચાલન કરો.',
    b2bPanel: 'B2B પેનલ',
    b2bPanelDesc: 'કોન્ટ્રાક્ટ, ટીમ એકાઉન્ટ્સ અને ઇન્વોઇસ હેન્ડલ કરો.',
    demoNote: 'ડેમો મોડ: નેવિગેશન રોલ-આધારિત UI ઍક્સેસ છે. પ્રમાણીકરણ API પછીથી ઉમેરી શકાય છે.'
  }
};

const langs = ['en', 'hi', 'gu'];

for (const lang of langs) {
  const filePath = path.join(__dirname, `${lang}.js`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('login: {')) {
    console.log(`login already exists in ${lang}.js`);
    continue;
  }

  const loginString = `,\n  login: ${JSON.stringify(loginTranslations[lang], null, 4)}`;
  
  // Find the last closing brace of the main object
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + loginString + '\n' + content.substring(lastBraceIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added login to ${lang}.js`);
  }
}
