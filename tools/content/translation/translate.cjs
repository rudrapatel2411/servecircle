const fs = require('fs');

const hubPath = 'client/src/pages/customer/SocietyManagementHub.jsx';
let hubCode = fs.readFileSync(hubPath, 'utf8');

const replacements = {
  'Live Staff Tracker': "{t('societyManagement.liveStaffTracker', 'Live Staff Tracker')}",
  'Sunita (Housemaid)': "{t('societyManagement.sunita', 'Sunita (Housemaid)')}",
  'Entered at 8:15 AM': "{t('societyManagement.enteredAt', 'Entered at 8:15 AM')}",
  'Inside': "{t('societyManagement.inside', 'Inside')}",
  'Rajesh (Car Cleaner)': "{t('societyManagement.rajesh', 'Rajesh (Car Cleaner)')}",
  'Last seen yesterday 9:30 AM': "{t('societyManagement.lastSeen', 'Last seen yesterday 9:30 AM')}",
  'Outside': "{t('societyManagement.outside', 'Outside')}",
  'Core Society Services': "{t('societyManagement.coreServices', 'Core Society Services')}",
  'Discounted Group Rates Applied': "{t('societyManagement.discountedRates', 'Discounted Group Rates Applied')}",
  'RWA Collective Cleanups': "{t('societyManagement.rwaCleanups', 'RWA Collective Cleanups')}",
  'Book shared park cleanup, lift lobby pressure washing, or boundary wall paint touch-ups. Join with neighbors for discounts!': "{t('societyManagement.rwaCleanupsDesc', 'Book shared park cleanup, lift lobby pressure washing, or boundary wall paint touch-ups. Join with neighbors for discounts!')}",
  '1 Home = 5% Off': "{t('societyManagement.oneHomeOff', '1 Home = 5% Off')}",
  '25 Homes =': "{t('societyManagement.twentyFiveHomes', '25 Homes =')}",
  '20% Off': "{t('societyManagement.twentyOff', '20% Off')}",
  'Start Group Booking': "{t('societyManagement.startGroupBooking', 'Start Group Booking')}",
  'Biometric Guard Roster': "{t('societyManagement.bioGuard', 'Biometric Guard Roster')}",
  'Deploy fully vetted, biometric-logged security personnel for gates and apartment blocks. Military veterans available.': "{t('societyManagement.bioGuardDesc', 'Deploy fully vetted, biometric-logged security personnel for gates and apartment blocks. Military veterans available.')}",
  '12-hour daily shifts': "{t('societyManagement.shift12', '12-hour daily shifts')}",
  'Monthly full deployment': "{t('societyManagement.monthlyDeploy', 'Monthly full deployment')}",
  'Fire safety drill certified': "{t('societyManagement.fireSafety', 'Fire safety drill certified')}",
  'Deploy Guards': "{t('societyManagement.deployGuards', 'Deploy Guards')}",
  'Society B2B Contracts': "{t('societyManagement.b2bContracts', 'Society B2B Contracts')}",
  'Comprehensive monthly or quarterly maintenance contracts designed for the entire society campus.': "{t('societyManagement.b2bContractsDesc', 'Comprehensive monthly or quarterly maintenance contracts designed for the entire society campus.')}",
  'Pest Control': "{t('societyManagement.pestControl', 'Pest Control')}",
  'Garden Maintenance': "{t('societyManagement.gardenMaint', 'Garden Maintenance')}",
  'Lobby Cleaning': "{t('societyManagement.lobbyCleaning', 'Lobby Cleaning')}",
  'View Contracts': "{t('societyManagement.viewContracts', 'View Contracts')}",
  'Customized Packages': "{t('societyManagement.customPackages', 'Customized Packages')}",
  "Tailor-made service bundles based on your society's size. Enjoy scalable pricing and priority support.": "{t('societyManagement.customPackagesDesc', `Tailor-made service bundles based on your society\\'s size. Enjoy scalable pricing and priority support.`)}",
  'Small: 5+ Homes': "{t('societyManagement.smallGroup', 'Small: 5+ Homes')}",
  'Medium: 10+ Homes': "{t('societyManagement.mediumGroup', 'Medium: 10+ Homes')}",
  'Mega: 15+ Homes': "{t('societyManagement.megaGroup', 'Mega: 15+ Homes')}",
  'Explore Packages': "{t('societyManagement.explorePackages', 'Explore Packages')}",
  'Premium Society Experiences': "{t('societyManagement.premiumExperiences', 'Premium Society Experiences')}",
  'Community Yoga & Zumba 🧘‍♀️': "{t('societyManagement.yoga', 'Community Yoga & Zumba')} 🧘‍♀️",
  'Hire a professional fitness instructor to come to your society park. Split costs with neighbors.': "{t('societyManagement.yogaDesc', 'Hire a professional fitness instructor to come to your society park. Split costs with neighbors.')}",
  'Book Instructor': "{t('societyManagement.bookInstructor', 'Book Instructor')}",
  'EV Charger Installation ⚡': "{t('societyManagement.evCharger', 'EV Charger Installation')} ⚡",
  'Hassle-free Electric Vehicle charger setup at your personal parking spot with RWA NOC included.': "{t('societyManagement.evChargerDesc', 'Hassle-free Electric Vehicle charger setup at your personal parking spot with RWA NOC included.')}",
  'Request Installation': "{t('societyManagement.reqInstall', 'Request Installation')}",
  'Waterless Car Wash 🚗✨': "{t('societyManagement.waterWash', 'Waterless Car Wash')} 🚗✨",
  'Eco-friendly, RWA-approved daily car cleaning subscription right in your parking spot.': "{t('societyManagement.waterWashDesc', 'Eco-friendly, RWA-approved daily car cleaning subscription right in your parking spot.')}",
  'Setup Subscription': "{t('societyManagement.setupSub', 'Setup Subscription')}"
};

for (const [key, value] of Object.entries(replacements)) {
  // Be careful with exact matches to not ruin tags
  hubCode = hubCode.replace(new RegExp('(?<=>)' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=<)', 'g'), value);
  // Also handle cases without tags if needed
  hubCode = hubCode.replace(new RegExp('^\\s*' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$', 'gm'), value);
  // specifically for text nodes inside elements
  hubCode = hubCode.replace(key, value); 
}

fs.writeFileSync(hubPath, hubCode);

console.log('Hub translated');

// Let's also patch SocietyPremiumFlow.jsx
const flowPath = 'client/src/pages/customer/SocietyPremiumFlow.jsx';
let flowCode = fs.readFileSync(flowPath, 'utf8');

// Add import { useTranslation } from 'react-i18next';
if (!flowCode.includes('useTranslation')) {
  flowCode = flowCode.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useTranslation } from 'react-i18next';");
  flowCode = flowCode.replace("const SocietyPremiumFlow = () => {", "const SocietyPremiumFlow = () => {\n  const { t } = useTranslation();");
}

fs.writeFileSync(flowPath, flowCode);
console.log('Flow translated');

