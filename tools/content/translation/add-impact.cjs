const fs = require('fs');
const path = require('path');

const impactTranslations = {
  en: {
    womenEmpowerment: 'Women Empowerment',
    firstJob: 'First Job Initiatives',
    localHeroes: 'Local Hero Stories',
    ngoPartners: 'NGO Partnerships',
    socialImpact: 'Social Impact',
    workingOnIt: 'We are actively working on bringing you more details about our {{title}} initiatives. Please check back soon for updates.',
    returnHome: 'Return to Home'
  },
  hi: {
    womenEmpowerment: 'महिला सशक्तिकरण',
    firstJob: 'पहली नौकरी पहल',
    localHeroes: 'लोकल हीरो की कहानियां',
    ngoPartners: 'NGO साझेदारी',
    socialImpact: 'सामाजिक प्रभाव',
    workingOnIt: 'हम सक्रिय रूप से आपको हमारे {{title}} पहलों के बारे में अधिक जानकारी देने पर काम कर रहे हैं। कृपया अपडेट के लिए जल्द ही वापस आएं।',
    returnHome: 'होम पर वापस जाएं'
  },
  gu: {
    womenEmpowerment: 'મહિલા સશક્તિકરણ',
    firstJob: 'પહેલી નોકરી પહેલ',
    localHeroes: 'લોકલ હીરોની વાર્તાઓ',
    ngoPartners: 'NGO ભાગીદારી',
    socialImpact: 'સામાજિક પ્રભાવ',
    workingOnIt: 'અમે સક્રિયપણે તમને અમારી {{title}} પહેલ વિશે વધુ વિગતો આપવા પર કામ કરી રહ્યા છીએ. કૃપા કરીને અપડેટ્સ માટે ટૂંક સમયમાં પાછા આવો.',
    returnHome: 'હોમ પર પાછા ફરો'
  }
};

const langs = ['en', 'hi', 'gu'];

for (const lang of langs) {
  const filePath = path.join(__dirname, `${lang}.js`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('impactDetail: {')) {
    console.log(`impactDetail already exists in ${lang}.js`);
    continue;
  }

  const impactString = `,\n  impactDetail: ${JSON.stringify(impactTranslations[lang], null, 4)}`;
  
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex !== -1) {
    content = content.substring(0, lastBraceIndex) + impactString + '\n' + content.substring(lastBraceIndex);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added impactDetail to ${lang}.js`);
  }
}
