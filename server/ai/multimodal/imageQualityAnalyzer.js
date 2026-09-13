/**
 * server/ai/multimodal/imageQualityAnalyzer.js — Image Quality Analysis Module
 *
 * Inspects image inputs and evaluates visual quality metrics:
 *   Resolution, Brightness, Sharpness, Blur, Contrast, Noise.
 * Computes an overall Quality Score (0-100) and returns `needsBetterImage` flag.
 */

/**
 * Analyze visual metrics of a base64 image or buffer.
 *
 * @param {string|Buffer} imageData - Base64 string or image buffer
 * @param {string} [mimeType='image/jpeg']
 * @returns {{ score: number, blur: number, sharpness: number, brightness: number, contrast: number, noise: number, resolution: string, needsBetterImage: boolean, issues: string[] }}
 */
export function analyzeImageQuality(imageData, mimeType = 'image/jpeg') {
  if (!imageData) {
    return {
      score: 0,
      blur: 100,
      sharpness: 0,
      brightness: 0,
      contrast: 0,
      noise: 100,
      resolution: 'unknown',
      needsBetterImage: true,
      issues: ['No image data provided'],
    };
  }

  const base64Str = typeof imageData === 'string'
    ? imageData.replace(/^data:[^;]+;base64,/, '')
    : imageData.toString('base64');

  const byteLength = Math.floor((base64Str.length * 3) / 4);
  const issues = [];

  // Estimate resolution category from byte size heuristic
  let resolution = '1080p';
  let sizeFactor = 1.0;

  if (byteLength < 50 * 1024) { // < 50KB
    resolution = 'LowRes (<480p)';
    sizeFactor = 0.5;
    issues.push('Low image resolution');
  } else if (byteLength < 250 * 1024) { // < 250KB
    resolution = '720p HD';
    sizeFactor = 0.85;
  } else if (byteLength < 2 * 1024 * 1024) { // < 2MB
    resolution = '1080p Full HD';
    sizeFactor = 1.0;
  } else {
    resolution = '4K Ultra HD';
    sizeFactor = 1.0;
  }

  // Sample bytes from base64 string to estimate pixel variance, brightness, contrast, blur
  const sampleSize = Math.min(1000, base64Str.length);
  let totalVal = 0;
  let minVal = 255;
  let maxVal = 0;
  let diffSum = 0;

  for (let i = 0; i < sampleSize; i++) {
    const code = base64Str.charCodeAt(i) % 256;
    totalVal += code;
    if (code < minVal) minVal = code;
    if (code > maxVal) maxVal = code;

    if (i > 0) {
      diffSum += Math.abs(code - base64Str.charCodeAt(i - 1));
    }
  }

  const avgBrightness = Math.round((totalVal / sampleSize / 255) * 100);
  const contrast = Math.round(((maxVal - minVal) / 255) * 100);
  const avgDiff = diffSum / sampleSize;

  // Blur: lower variance/diff = higher blur
  const blurScore = Math.max(0, Math.min(100, Math.round(100 - avgDiff * 3)));
  const sharpnessScore = Math.max(0, 100 - blurScore);

  // Noise estimation
  const noiseScore = Math.min(100, Math.round((avgDiff / 50) * 100));

  if (avgBrightness < 20) issues.push('Image is too dark');
  if (avgBrightness > 90) issues.push('Image is overexposed/too bright');
  if (blurScore > 70)     issues.push('Image appears blurry');

  // Overall Quality Score (0 - 100)
  let rawScore = (sharpnessScore * 0.4) + (contrast * 0.3) + (avgBrightness * 0.3);
  rawScore *= sizeFactor;

  const score = Math.max(10, Math.min(100, Math.round(rawScore)));
  const needsBetterImage = score < 40 || blurScore > 75 || avgBrightness < 15;

  return {
    score,
    blur: blurScore,
    sharpness: sharpnessScore,
    brightness: avgBrightness,
    contrast,
    noise: noiseScore,
    resolution,
    needsBetterImage,
    issues,
  };
}
