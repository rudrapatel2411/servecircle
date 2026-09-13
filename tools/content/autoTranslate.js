const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');
const repoRoot = path.resolve(__dirname, '..', '..');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function translateObject(obj, targetLang) {
    const translatedObj = {};
    for (const [key, value] of Object.entries(obj)) {
        console.log(`Translating ${key} to ${targetLang}...`);
        
        let translatedService = {};
        
        try {
            // Translate name
            const resName = await translate(value.name, { to: targetLang });
            translatedService.name = resName.text;
            await delay(100);
            
            // Translate description
            const resDesc = await translate(value.description, { to: targetLang });
            translatedService.description = resDesc.text;
            await delay(100);
            
            // Translate features array
            translatedService.features = [];
            for (const feature of value.features) {
                const resFeat = await translate(feature, { to: targetLang });
                translatedService.features.push(resFeat.text);
                await delay(100);
            }
            
            // Translate beforeAfter
            translatedService.beforeAfter = {};
            const resBefore = await translate(value.beforeAfter.before, { to: targetLang });
            translatedService.beforeAfter.before = resBefore.text;
            await delay(100);
            
            const resAfter = await translate(value.beforeAfter.after, { to: targetLang });
            translatedService.beforeAfter.after = resAfter.text;
            await delay(100);

            translatedObj[key] = translatedService;
            
        } catch (e) {
            console.error(`Error translating ${key}:`, e.message);
            // Fallback to English if translation fails (e.g. rate limit)
            translatedObj[key] = value;
        }
    }
    return translatedObj;
}

async function run() {
    const enPath = path.join(repoRoot, 'client', 'src', 'i18n', 'services_en.json');
    const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    
    // Only translate the first 10 for speed and rate limits in this demo,
    // the rest will be copied as English to prevent long hangs and rate limits.
    const entries = Object.entries(enData);
    
    const translateLimit = 15;
    const toTranslate = Object.fromEntries(entries.slice(0, translateLimit));
    const toCopy = Object.fromEntries(entries.slice(translateLimit));
    
    console.log(`Starting Hindi translation...`);
    const hiTranslated = await translateObject(toTranslate, 'hi');
    const hiFinal = { ...hiTranslated, ...toCopy };
    fs.writeFileSync(path.join(repoRoot, 'client', 'src', 'i18n', 'services_hi.json'), JSON.stringify(hiFinal, null, 2));
    
    console.log(`Starting Gujarati translation...`);
    const guTranslated = await translateObject(toTranslate, 'gu');
    const guFinal = { ...guTranslated, ...toCopy };
    fs.writeFileSync(path.join(repoRoot, 'client', 'src', 'i18n', 'services_gu.json'), JSON.stringify(guFinal, null, 2));
    
    console.log('Translation complete!');
}

run();
