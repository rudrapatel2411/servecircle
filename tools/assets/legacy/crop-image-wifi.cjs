const sharp = require('sharp');
const fs = require('fs');

const inputPath = 'C:\\Users\\rudra\\.gemini\\antigravity-ide\\brain\\a007d253-cde4-49d8-a179-bc6fd02fc6c6\\media__1783457564948.jpg';
const outputPath = 'd:\\ServeCircle\\client\\public\\wifi-setup-uploaded.jpg';

async function cropImage() {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // We want to crop a few pixels from the bottom to remove the watermark/number
    // Let's crop 40 pixels from the bottom
    const extractHeight = Math.max(10, metadata.height - 40);
    
    await sharp(inputPath)
      .extract({ left: 0, top: 0, width: metadata.width, height: extractHeight })
      .toFile(outputPath);
      
    console.log('Successfully cropped and saved to', outputPath);
  } catch (error) {
    console.error('Error cropping image:', error);
  }
}

cropImage();
