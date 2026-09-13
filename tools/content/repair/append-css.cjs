const fs = require('fs');
const path = require('path');

const cssToAppend = `
/* ==== Category Directories Grid & Cards (BrowseServices) ==== */
.category-directories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 20px;
}

.category-directory-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 220px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  text-decoration: none;
  background: var(--navy-900);
}

.category-directory-img-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.category-directory-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-directory-img-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 60%, rgba(15, 23, 42, 0.2) 100%);
}

.category-directory-icon-badge {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.category-directory-content {
  position: relative;
  z-index: 2;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.category-directory-title {
  font-size: 1.25rem;
  font-weight: 850;
  color: white;
  margin: 0 0 6px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.category-directory-desc {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
  margin: 0 0 16px 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.category-directory-footer {
  margin-top: 0;
}

.category-directory-link-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 800;
  background: rgba(255,255,255,0.1);
  padding: 6px 12px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  color: white !important; /* Ensure it overrides inline style if needed, though inline usually wins. I will let inline win. */
}

.category-directory-arrow {
  transition: transform 0.2s ease;
}

.category-directory-card:hover .category-directory-arrow {
  transform: translateX(4px);
}
`;

fs.appendFileSync('client/src/pages/customer/CustomerPages.css', cssToAppend);
console.log('Appended missing CSS rules successfully!');
