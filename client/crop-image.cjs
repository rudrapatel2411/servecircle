const { Jimp } = require('jimp');
const path = require('path');

async function processImage() {
  const inputPath = 'C:\\Users\\rudra\\.gemini\\antigravity-ide\\brain\\a007d253-cde4-49d8-a179-bc6fd02fc6c6\\media__1783454858413.jpg';
  const outputPath = 'd:\\ServeCircle\\client\\public\\bike-repair-uploaded.jpg';
  
  try {
    const image = await Jimp.read(inputPath);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // Crop the bottom 8% (usually watermarks like this are at the bottom 5-8%)
    const cropHeight = Math.floor(height * 0.92);
    
    image.crop({ x: 0, y: 0, w: width, h: cropHeight });
    await image.write(outputPath);
    console.log('Successfully cropped and saved to', outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
