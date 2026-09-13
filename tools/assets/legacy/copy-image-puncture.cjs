const fs = require('fs');

const inputPath = 'C:\\Users\\rudra\\.gemini\\antigravity-ide\\brain\\a007d253-cde4-49d8-a179-bc6fd02fc6c6\\media__1783455770452.jpg';
const outputPath = 'd:\\ServeCircle\\client\\public\\bike-puncture-uploaded.jpg';

try {
  fs.copyFileSync(inputPath, outputPath);
  console.log('Successfully copied to', outputPath);
} catch (error) {
  console.error('Error copying image:', error);
}
