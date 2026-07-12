const fs = require('fs');

const path = 'client/src/pages/customer/SocietyPremiumFlow.jsx';
let code = fs.readFileSync(path, 'utf8');

// Basic string replacements for titles and buttons
const replacements = {
  'Back to Hub': "{t('societyFlow.back', 'Back to Hub')}",
  'Please select an option to continue.': "{t('societyFlow.selectOption', 'Please select an option to continue.')}",
  'Continue to Step 2': "{t('societyFlow.continue', 'Continue to Step 2')}",
  'Confirm & Proceed to Payment': "{t('societyFlow.confirm', 'Confirm & Proceed to Payment')}",
  'Processing...': "{t('societyFlow.processing', 'Processing...')}"
};

for (const [key, value] of Object.entries(replacements)) {
  code = code.replace(new RegExp('(?<=>)' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=<)', 'g'), value);
}

// Adding to hi.js and gu.js
const translations = {
  societyFlow: {
    back: 'Back to Hub',
    selectOption: 'Please select an option to continue.',
    continue: 'Continue to Step 2',
    confirm: 'Confirm & Proceed to Payment',
    processing: 'Processing...'
  }
};

const hindiTranslations = {
  societyFlow: {
    back: 'हब पर वापस जाएं',
    selectOption: 'जारी रखने के लिए कृपया एक विकल्प चुनें।',
    continue: 'चरण 2 पर जारी रखें',
    confirm: 'पुष्टि करें और भुगतान के लिए आगे बढ़ें',
    processing: 'प्रसंस्करण हो रहा है...'
  }
};

const gujTranslations = {
  societyFlow: {
    back: 'હબ પર પાછા જાઓ',
    selectOption: 'ચાલુ રાખવા માટે કૃપા કરીને એક વિકલ્પ પસંદ કરો.',
    continue: 'પગલું 2 પર ચાલુ રાખો',
    confirm: 'પુષ્ટિ કરો અને ચુકવણી માટે આગળ વધો',
    processing: 'પ્રક્રિયા થઈ રહી છે...'
  }
};

const injectTranslations = (filePath, transObj) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const keyString = `societyFlow: ${JSON.stringify(transObj.societyFlow, null, 2)},`;
  const regex = /societyFlow:\s*\{[\s\S]*?\},\n/g;
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

fs.writeFileSync(path, code);
console.log('Flow translated');
