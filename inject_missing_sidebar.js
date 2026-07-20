const fs = require('fs');

const missingHi = {
  bookServices: 'सेवाएं बुक करें',
  myContracts: 'मेरे कॉन्ट्रैक्ट',
  myBlocks: 'मेरे टावर/ब्लॉक',
  serviceHistory: 'सेवा इतिहास',
  support: 'सहायता व सपोर्ट',
};

const missingGu = {
  bookServices: 'સેવાઓ બુક કરો',
  myContracts: 'મારા કોન્ટ્રાક્ટ્સ',
  myBlocks: 'મારા ટાવર/બ્લોક',
  serviceHistory: 'સેવા ઇતિહાસ',
  support: 'સહાય અને સપોર્ટ',
};

function injectMissing(filePath, additions) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the 'pendingInvoices' key inside the b2b object and inject the new keys right after it.
  const regex = /pendingInvoices:\s*'[^']+',/g;
  
  const injectString = Object.entries(additions)
    .map(([k, v]) => `\n    ${k}: '${v}',`)
    .join('');
    
  if (regex.test(content)) {
    content = content.replace(/pendingInvoices:\s*'[^']+',/, match => match + injectString);
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Could not find anchor in ${filePath}`);
  }
}

injectMissing('client/src/i18n/hi.js', missingHi);
injectMissing('client/src/i18n/gu.js', missingGu);
