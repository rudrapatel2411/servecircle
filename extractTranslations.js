const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, 'client/src/data/servicesRegistry.js');
const fileContent = fs.readFileSync(registryPath, 'utf8');

// We need to parse the array. It's safe to eval here since it's just our own data file.
const evalContent = fileContent.replace('export const servicesRegistry =', 'return');
const servicesRegistry = new Function(evalContent)();

const enTranslations = {};

// Transform the registry
const newRegistry = servicesRegistry.map(service => {
    // Save to translation dict
    enTranslations[service.id] = {
        name: service.name,
        description: service.description,
        features: service.features,
        beforeAfter: {
            before: service.beforeAfter.before,
            after: service.beforeAfter.after
        }
    };

    // Return new object with keys instead of text
    return {
        id: service.id,
        category: service.category,
        nameKey: `services.${service.id}.name`,
        descKey: `services.${service.id}.description`,
        featuresKey: `services.${service.id}.features`,
        beforeAfterKey: `services.${service.id}.beforeAfter`,
        basePrice: service.basePrice,
        standardPrice: service.standardPrice,
        premiumPrice: service.premiumPrice,
        rating: service.rating,
        jobsDone: service.jobsDone
    };
});

// Output the new translations
fs.writeFileSync(
    path.join(__dirname, 'client/src/i18n/services_en.json'), 
    JSON.stringify(enTranslations, null, 2)
);

// Output the new registry file
const newFileContent = `// central registry of 50+ services with categories, detailed specifications, pricing, review stats.
// Text content has been extracted to i18n JSON files for multi-language support.

export const servicesRegistry = ${JSON.stringify(newRegistry, null, 2)};
`;

fs.writeFileSync(registryPath, newFileContent);
console.log('Successfully extracted translations and updated servicesRegistry.js');
