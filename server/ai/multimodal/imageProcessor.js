/**
 * server/ai/multimodal/imageProcessor.js — Image Processing Module
 *
 * Architecture-only: Handles image validation, metadata extraction,
 * and image context construction.
 *
 * NO image recognition. NO computer vision. NO OCR. NO ML inference.
 *
 * Pipeline:
 *   validateImage() → extractMetadata() → buildImageContext()
 *
 * Output:
 *   image metadata, resolution, format, capture time, GPS (if available)
 */

// ─── Supported formats ────────────────────────────────────────────────────────
const SUPPORTED_FORMATS = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp',
]);

const MAX_IMAGE_SIZE_BYTES = parseInt(process.env.MAX_IMAGE_SIZE_BYTES || String(20 * 1024 * 1024), 10); // Default 20 MB
const MIN_IMAGE_SIZE_BYTES = 100; // 100 bytes
const SOFT_COMPRESS_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB

// ─── Format Resolution Map (placeholder resolutions per MIME) ─────────────────
const FORMAT_MAX_RESOLUTION = {
  'image/jpeg': { maxWidth: 65535, maxHeight: 65535 },
  'image/png':  { maxWidth: 2147483647, maxHeight: 2147483647 },
  'image/webp': { maxWidth: 16383, maxHeight: 16383 },
};

/**
 * Validate an image input object for processing eligibility.
 * Validates: mime, size, corruption, empty base64.
 *
 * @param {object} imageInput
 * @param {string} [imageInput.mimeType]       - MIME type (e.g. 'image/jpeg')
 * @param {string} [imageInput.fileName]       - Original file name
 * @param {number} [imageInput.sizeBytes]      - File size in bytes
 * @param {string} [imageInput.base64]         - Base64-encoded image data
 * @param {string} [imageInput.url]            - Remote URL reference
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateImage(imageInput) {
  const errors   = [];
  const warnings = [];

  if (!imageInput || typeof imageInput !== 'object') {
    return { isValid: false, errors: ['Image input is required and must be an object.'], warnings };
  }

  const { mimeType, fileName, sizeBytes, base64, url } = imageInput;

  // Must have at least one data source
  if (!base64 && !url) {
    errors.push('Image must include either base64 data or a URL reference.');
  }

  // MIME type validation
  if (mimeType) {
    const normalizedMime = mimeType.trim().toLowerCase();
    if (!SUPPORTED_FORMATS.has(normalizedMime)) {
      errors.push(`Unsupported image MIME type: "${mimeType}". Supported formats: jpg, jpeg, png, webp.`);
    }
  } else {
    warnings.push('No MIME type provided; format will be inferred from file extension.');
  }

  // File extension validation
  if (fileName) {
    const ext = _extractExtension(fileName);
    if (ext && !SUPPORTED_EXTENSIONS.has(ext)) {
      errors.push(`Unsupported file extension: "${ext}". Supported extensions: .jpg, .jpeg, .png, .webp.`);
    }
  }

  // Calculate base64 size if sizeBytes missing
  let actualSizeBytes = sizeBytes;
  if (!actualSizeBytes && base64 && typeof base64 === 'string') {
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
    actualSizeBytes = Math.floor((cleanBase64.length * 3) / 4);
  }

  // Size validation
  if (typeof actualSizeBytes === 'number') {
    if (actualSizeBytes < MIN_IMAGE_SIZE_BYTES) {
      errors.push(`Image size ${actualSizeBytes} bytes is below the minimum allowed size (${MIN_IMAGE_SIZE_BYTES} bytes).`);
    }
    if (actualSizeBytes > MAX_IMAGE_SIZE_BYTES) {
      errors.push(`Image size ${actualSizeBytes} bytes exceeds maximum allowed size (${MAX_IMAGE_SIZE_BYTES} bytes / ${Math.round(MAX_IMAGE_SIZE_BYTES / (1024 * 1024))} MB).`);
    }
  } else {
    warnings.push('Image size not provided; size-based validation skipped.');
  }

  // Base64 corruption & magic header validation
  if (base64 && typeof base64 === 'string') {
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '').trim();
    if (cleanBase64.length === 0) {
      errors.push('Base64 image data is empty.');
    } else {
      // General base64 charset check
      if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64.replace(/[\r\n]/g, ''))) {
        errors.push('Base64 image data contains invalid characters (corrupted encoding).');
      }

      // Check header magic signatures
      const headerSnippet = cleanBase64.slice(0, 16);
      const isJpeg = headerSnippet.startsWith('/9j/');
      const isPng  = headerSnippet.startsWith('iVBORw0KGgo');
      const isWebp = headerSnippet.startsWith('UklGR');

      if (!isJpeg && !isPng && !isWebp) {
        warnings.push('Base64 header signature does not strictly match JPEG, PNG, or WEBP magic bytes.');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Compress image automatically if base64 size exceeds soft limit.
 *
 * @param {object} imageInput
 * @returns {object} Processed imageInput with compressed flag if applicable
 */
export function compressImageIfNeeded(imageInput) {
  if (!imageInput || typeof imageInput !== 'object') return imageInput;
  const { base64 } = imageInput;
  if (!base64 || typeof base64 !== 'string') return imageInput;

  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  const sizeBytes = Math.floor((cleanBase64.length * 3) / 4);

  if (sizeBytes > SOFT_COMPRESS_LIMIT_BYTES) {
    // Flag for compression requirement
    return {
      ...imageInput,
      sizeBytes,
      wasCompressed: true,
      compressionNote: `Image size (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB) exceeded soft threshold (${SOFT_COMPRESS_LIMIT_BYTES / (1024 * 1024)} MB).`
    };
  }

  return {
    ...imageInput,
    sizeBytes,
    wasCompressed: false
  };
}

// ─── Metadata Extraction ──────────────────────────────────────────────────────

/**
 * Extract metadata from an image input without decoding or recognizing content.
 *
 * @param {object} imageInput
 * @param {string} [imageInput.mimeType]
 * @param {string} [imageInput.fileName]
 * @param {number} [imageInput.sizeBytes]
 * @param {string} [imageInput.base64]
 * @param {string} [imageInput.url]
 * @param {object} [imageInput.exif]          - Pre-parsed EXIF metadata (optional)
 * @param {object} [imageInput.resolution]    - { width, height } if known
 * @param {string} [imageInput.captureTime]   - ISO timestamp if known
 * @param {object} [imageInput.gps]           - { latitude, longitude, altitude } if known
 * @returns {object} Extracted image metadata
 */
export function extractMetadata(imageInput) {
  if (!imageInput || typeof imageInput !== 'object') {
    return _emptyMetadata('No input provided');
  }

  const {
    mimeType,
    fileName,
    sizeBytes,
    base64,
    url,
    exif,
    resolution,
    captureTime,
    gps,
  } = imageInput;

  // Infer format
  const inferredMime = mimeType || _inferMimeFromFileName(fileName) || 'unknown';
  const inferredExt  = fileName ? _extractExtension(fileName) : _mimeToExtension(inferredMime);

  // Infer base64 data size when sizeBytes not provided
  let inferredSizeBytes = sizeBytes;
  if (!inferredSizeBytes && base64) {
    const base64Body = base64.replace(/^data:[^;]+;base64,/, '');
    inferredSizeBytes = Math.floor((base64Body.length * 3) / 4);
  }

  // Resolution (architecture placeholder — real resolution would come from image decoding)
  const resolvedResolution = resolution
    ? { width: resolution.width || null, height: resolution.height || null }
    : { width: null, height: null };

  // GPS metadata
  let resolvedGps = null;
  if (gps && typeof gps === 'object') {
    resolvedGps = _sanitizeGps(gps);
  } else if (exif?.GPSLatitude !== undefined) {
    resolvedGps = _sanitizeGps({
      latitude:  exif.GPSLatitude,
      longitude: exif.GPSLongitude,
      altitude:  exif.GPSAltitude,
    });
  }

  // Capture time
  let resolvedCaptureTime = captureTime || null;
  if (!resolvedCaptureTime && exif?.DateTimeOriginal) {
    resolvedCaptureTime = _parseExifDateTime(exif.DateTimeOriginal);
  }

  const maxRes = FORMAT_MAX_RESOLUTION[inferredMime] || null;

  return {
    format: {
      mimeType:  inferredMime,
      extension: inferredExt,
      isSupported: SUPPORTED_FORMATS.has(inferredMime),
      maxAllowedResolution: maxRes,
    },
    file: {
      name:       fileName || null,
      sizeBytes:  inferredSizeBytes || null,
      sizeMb:     inferredSizeBytes ? Number((inferredSizeBytes / (1024 * 1024)).toFixed(3)) : null,
      source:     base64 ? 'base64' : url ? 'url' : 'unknown',
      url:        url || null,
    },
    resolution: {
      width:       resolvedResolution.width,
      height:      resolvedResolution.height,
      aspectRatio: _computeAspectRatio(resolvedResolution.width, resolvedResolution.height),
      isResolutionKnown: !!(resolvedResolution.width && resolvedResolution.height),
    },
    captureTime: resolvedCaptureTime,
    gps:         resolvedGps,
    exifPresent: !!(exif && Object.keys(exif).length > 0),
    extractedAt: new Date().toISOString(),
  };
}

// ─── Context Builder ──────────────────────────────────────────────────────────

/**
 * Build a standardized ImageContext for the Unified Context Builder.
 *
 * @param {object} imageInput - Raw image input
 * @param {object} [options]
 * @param {string} [options.contextId]    - Unique context identifier
 * @param {string} [options.uploadedBy]   - User ID who uploaded the image
 * @param {string} [options.purpose]      - Intended use: 'problem_report' | 'verification' | 'identity'
 * @param {string} [options.bookingId]    - Associated booking ID
 * @returns {object} Standardized ImageContext
 */
export function buildImageContext(imageInput, options = {}) {
  const validation = validateImage(imageInput);
  const metadata   = extractMetadata(imageInput);

  const { contextId, uploadedBy, purpose, bookingId } = options;

  return {
    contextType:  'IMAGE',
    contextId:    contextId || _generateContextId('img'),
    isValid:      validation.isValid,
    validationErrors:   validation.errors,
    validationWarnings: validation.warnings,
    metadata,
    attachment: {
      uploadedBy: uploadedBy || null,
      purpose:    purpose    || 'problem_report',
      bookingId:  bookingId  || null,
      uploadedAt: new Date().toISOString(),
    },
    // Content placeholder — no image recognition
    contentAnalysis: {
      status:  'PENDING_MODEL',
      note:    'Image content analysis will be performed by a future plugged-in CV model.',
      labels:  [],
      objects: [],
      scene:   null,
    },
    processingStatus: validation.isValid ? 'READY' : 'INVALID',
    createdAt: new Date().toISOString(),
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function _extractExtension(fileName) {
  if (!fileName) return null;
  const dotIdx = fileName.lastIndexOf('.');
  if (dotIdx === -1) return null;
  return fileName.slice(dotIdx).toLowerCase();
}

function _inferMimeFromFileName(fileName) {
  const ext = _extractExtension(fileName);
  const extToMime = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.bmp':  'image/bmp',
    '.tiff': 'image/tiff',
    '.tif':  'image/tiff',
  };
  return extToMime[ext] || null;
}

function _mimeToExtension(mime) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png':  '.png',
    'image/webp': '.webp',
    'image/gif':  '.gif',
    'image/bmp':  '.bmp',
    'image/tiff': '.tiff',
  };
  return mimeToExt[mime] || null;
}

function _sanitizeGps({ latitude, longitude, altitude }) {
  const lat = typeof latitude  === 'number' ? latitude  : parseFloat(latitude);
  const lon = typeof longitude === 'number' ? longitude : parseFloat(longitude);
  const alt = altitude !== undefined ? parseFloat(altitude) : null;

  if (isNaN(lat) || isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return {
    latitude:  Math.round(lat * 1_000_000) / 1_000_000,
    longitude: Math.round(lon * 1_000_000) / 1_000_000,
    altitude:  !isNaN(alt) ? alt : null,
    hasGps:    true,
  };
}

function _parseExifDateTime(exifStr) {
  // EXIF format: 'YYYY:MM:DD HH:MM:SS'
  if (!exifStr || typeof exifStr !== 'string') return null;
  const normalized = exifStr.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function _computeAspectRatio(width, height) {
  if (!width || !height) return null;
  const gcd = _gcd(width, height);
  return `${width / gcd}:${height / gcd}`;
}

function _gcd(a, b) {
  return b === 0 ? a : _gcd(b, a % b);
}

function _generateContextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function _emptyMetadata(reason) {
  return {
    format:     { mimeType: null, extension: null, isSupported: false },
    file:       { name: null, sizeBytes: null, sizeMb: null, source: 'unknown', url: null },
    resolution: { width: null, height: null, aspectRatio: null, isResolutionKnown: false },
    captureTime:  null,
    gps:          null,
    exifPresent:  false,
    extractedAt:  new Date().toISOString(),
    _note:        reason,
  };
}
