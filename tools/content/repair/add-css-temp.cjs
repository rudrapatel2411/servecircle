const fs = require('fs');
const css = `
.service-card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.service-card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  border-color: #cbd5e1 !important;
}
`;
fs.appendFileSync('client/src/pages/customer/CustomerPages.css', css);
