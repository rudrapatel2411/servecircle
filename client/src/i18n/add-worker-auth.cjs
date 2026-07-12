const fs = require('fs');
const path = require('path');

const workerAuthTranslations = {
  en: {
    workerPanel: "Worker Panel",
    workerSubtitle: "Sign in to manage jobs, schedule, and earnings.",
    workerLogin: "Worker Login",
    demoCreds: "Demo credentials are prefilled from the seeded database.",
    emailReq: "Email and password are required",
    emailLabel: "Email",
    passwordLabel: "Password",
    signingIn: "Signing in...",
    signInWorker: "Sign in as Worker"
  },
  hi: {
    workerPanel: "वर्कर पैनल",
    workerSubtitle: "नौकरियों, अनुसूची और कमाई का प्रबंधन करने के लिए साइन इन करें।",
    workerLogin: "वर्कर लॉगिन",
    demoCreds: "डेमो क्रेडेंशियल सीडेड डेटाबेस से पहले से भरे हुए हैं।",
    emailReq: "ईमेल और पासवर्ड आवश्यक हैं",
    emailLabel: "ईमेल",
    passwordLabel: "पासवर्ड",
    signingIn: "साइन इन हो रहा है...",
    signInWorker: "वर्कर के रूप में साइन इन करें"
  },
  gu: {
    workerPanel: "વર્કર પેનલ",
    workerSubtitle: "નોકરીઓ, સમયપત્રક અને કમાણીનું સંચાલન કરવા માટે સાઇન ઇન કરો.",
    workerLogin: "વર્કર લોગિન",
    demoCreds: "ડેમો ઓળખપત્રો સીડેડ ડેટાબેઝમાંથી પહેલેથી જ ભરેલા છે.",
    emailReq: "ઇમેઇલ અને પાસવર્ડ આવશ્યક છે",
    emailLabel: "ઇમેઇલ",
    passwordLabel: "પાસવર્ડ",
    signingIn: "સાઇન ઇન થઈ રહ્યું છે...",
    signInWorker: "વર્કર તરીકે સાઇન ઇન કરો"
  }
};

const langs = ['en', 'hi', 'gu'];

for (const lang of langs) {
  const filePath = path.join(__dirname, `${lang}.js`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('workerAuth: {')) {
    console.log(`workerAuth already exists in ${lang}.js`);
    continue;
  }

  const flowString = `,\n  workerAuth: ${JSON.stringify(workerAuthTranslations[lang], null, 4)}`;
  
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + flowString + '\n' + content.substring(lastBraceIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added workerAuth to ${lang}.js`);
  }
}
