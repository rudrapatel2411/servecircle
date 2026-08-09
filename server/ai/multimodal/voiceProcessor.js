/**
 * server/ai/multimodal/voiceProcessor.js — Voice/Audio Processing Module
 *
 * Architecture-only: Handles audio validation, metadata extraction,
 * and voice context construction.
 *
 * NO speech-to-text. NO speech recognition. NO audio ML inference.
 *
 * Pipeline:
 *   validateAudio() → extractMetadata() → buildVoiceContext()
 *
 * Output:
 *   duration, sample rate, language placeholder, format
 */

// ─── Supported audio formats ──────────────────────────────────────────────────
const SUPPORTED_AUDIO_MIME = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/wav',
  'audio/wave',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
  'audio/amr',
  'audio/3gpp',
]);

const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  '.mp3', '.mp4', '.m4a', '.aac', '.ogg', '.wav', '.webm', '.flac', '.amr', '.3gp', '.3gpp',
]);

const MAX_AUDIO_SIZE_BYTES   = 50 * 1024 * 1024;  // 50 MB
const MIN_AUDIO_SIZE_BYTES   = 500;                // 500 bytes
const MAX_DURATION_SECONDS   = 600;                // 10 minutes
const MIN_DURATION_SECONDS   = 0.5;               // half second

// ─── Standard sample rates ────────────────────────────────────────────────────
const STANDARD_SAMPLE_RATES = new Set([8000, 11025, 16000, 22050, 24000, 44100, 48000, 96000, 192000]);

// ─── MIME → extension map ─────────────────────────────────────────────────────
const MIME_TO_EXT = {
  'audio/mpeg':   '.mp3',
  'audio/mp3':    '.mp3',
  'audio/mp4':    '.m4a',
  'audio/aac':    '.aac',
  'audio/ogg':    '.ogg',
  'audio/wav':    '.wav',
  'audio/wave':   '.wav',
  'audio/webm':   '.webm',
  'audio/flac':   '.flac',
  'audio/x-flac': '.flac',
  'audio/amr':    '.amr',
  'audio/3gpp':   '.3gp',
};

const EXT_TO_MIME = {
  '.mp3':  'audio/mpeg',
  '.m4a':  'audio/mp4',
  '.aac':  'audio/aac',
  '.ogg':  'audio/ogg',
  '.wav':  'audio/wav',
  '.webm': 'audio/webm',
  '.flac': 'audio/flac',
  '.amr':  'audio/amr',
  '.3gp':  'audio/3gpp',
  '.3gpp': 'audio/3gpp',
};

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate an audio input object for processing eligibility.
 *
 * @param {object} audioInput
 * @param {string} [audioInput.mimeType]        - MIME type (e.g. 'audio/wav')
 * @param {string} [audioInput.fileName]        - Original file name
 * @param {number} [audioInput.sizeBytes]       - File size in bytes
 * @param {number} [audioInput.durationSeconds] - Audio duration in seconds
 * @param {number} [audioInput.sampleRate]      - Sample rate in Hz (e.g. 44100)
 * @param {number} [audioInput.channels]        - Number of audio channels (1 = mono, 2 = stereo)
 * @param {string} [audioInput.base64]          - Base64-encoded audio data (optional)
 * @param {string} [audioInput.url]             - Remote URL reference (optional)
 * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
 */
export function validateAudio(audioInput) {
  const errors   = [];
  const warnings = [];

  if (!audioInput || typeof audioInput !== 'object') {
    return { isValid: false, errors: ['Audio input is required and must be an object.'], warnings };
  }

  const { mimeType, fileName, sizeBytes, durationSeconds, sampleRate, channels, base64, url } = audioInput;

  // Must have at least one data source
  if (!base64 && !url) {
    errors.push('Audio must include either base64 data or a URL reference.');
  }

  // MIME type validation
  if (mimeType) {
    const normalizedMime = mimeType.trim().toLowerCase();
    if (!SUPPORTED_AUDIO_MIME.has(normalizedMime)) {
      errors.push(`Unsupported audio MIME type: "${mimeType}". Supported: ${[...SUPPORTED_AUDIO_MIME].join(', ')}`);
    }
  } else {
    warnings.push('No MIME type provided; format will be inferred from file extension.');
  }

  // Extension validation
  if (fileName) {
    const ext = _extractExtension(fileName);
    if (ext && !SUPPORTED_AUDIO_EXTENSIONS.has(ext)) {
      errors.push(`Unsupported audio file extension: "${ext}".`);
    }
  }

  // Size validation
  if (typeof sizeBytes === 'number') {
    if (sizeBytes < MIN_AUDIO_SIZE_BYTES) {
      errors.push(`Audio size ${sizeBytes} bytes is below minimum (${MIN_AUDIO_SIZE_BYTES} bytes).`);
    }
    if (sizeBytes > MAX_AUDIO_SIZE_BYTES) {
      errors.push(`Audio size ${sizeBytes} bytes exceeds maximum (${MAX_AUDIO_SIZE_BYTES} bytes / 50 MB).`);
    }
  } else {
    warnings.push('Audio size not provided; size validation skipped.');
  }

  // Duration validation
  if (typeof durationSeconds === 'number') {
    if (durationSeconds < MIN_DURATION_SECONDS) {
      errors.push(`Audio duration ${durationSeconds}s is below minimum (${MIN_DURATION_SECONDS}s).`);
    }
    if (durationSeconds > MAX_DURATION_SECONDS) {
      errors.push(`Audio duration ${durationSeconds}s exceeds maximum (${MAX_DURATION_SECONDS}s / 10 minutes).`);
    }
  } else {
    warnings.push('Audio duration not provided; duration validation skipped.');
  }

  // Sample rate validation
  if (typeof sampleRate === 'number') {
    if (!STANDARD_SAMPLE_RATES.has(sampleRate)) {
      warnings.push(`Non-standard sample rate: ${sampleRate} Hz. Standard rates: ${[...STANDARD_SAMPLE_RATES].join(', ')} Hz.`);
    }
  } else {
    warnings.push('Sample rate not provided; quality assessment skipped.');
  }

  // Channels validation
  if (typeof channels === 'number') {
    if (channels < 1 || channels > 8) {
      warnings.push(`Unusual channel count: ${channels}. Expected 1 (mono) or 2 (stereo).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Metadata Extraction ──────────────────────────────────────────────────────

/**
 * Extract metadata from an audio input without decoding or transcribing.
 *
 * @param {object} audioInput
 * @param {string} [audioInput.mimeType]
 * @param {string} [audioInput.fileName]
 * @param {number} [audioInput.sizeBytes]
 * @param {number} [audioInput.durationSeconds]
 * @param {number} [audioInput.sampleRate]
 * @param {number} [audioInput.channels]
 * @param {number} [audioInput.bitrate]          - Bitrate in kbps
 * @param {string} [audioInput.codec]            - Audio codec name
 * @param {string} [audioInput.base64]
 * @param {string} [audioInput.url]
 * @param {string} [audioInput.recordedAt]       - ISO timestamp when audio was recorded
 * @param {object} [audioInput.deviceInfo]       - Capture device info
 * @returns {object} Extracted audio metadata
 */
export function extractMetadata(audioInput) {
  if (!audioInput || typeof audioInput !== 'object') {
    return _emptyMetadata('No input provided');
  }

  const {
    mimeType,
    fileName,
    sizeBytes,
    durationSeconds,
    sampleRate,
    channels,
    bitrate,
    codec,
    base64,
    url,
    recordedAt,
    deviceInfo,
  } = audioInput;

  // Infer format
  const inferredMime = mimeType || _inferMimeFromFileName(fileName) || 'unknown';
  const inferredExt  = fileName ? _extractExtension(fileName) : (MIME_TO_EXT[inferredMime] || null);

  // Infer base64 data size
  let inferredSizeBytes = sizeBytes;
  if (!inferredSizeBytes && base64) {
    const base64Body = base64.replace(/^data:[^;]+;base64,/, '');
    inferredSizeBytes = Math.floor((base64Body.length * 3) / 4);
  }

  // Quality assessment (rule-based)
  const quality = _assessAudioQuality({ sampleRate, channels, bitrate, durationSeconds });

  // Channels label
  const channelLabel = channels === 1 ? 'mono'
    : channels === 2 ? 'stereo'
    : channels > 2   ? 'surround'
    : 'unknown';

  return {
    format: {
      mimeType:    inferredMime,
      extension:   inferredExt,
      codec:       codec || null,
      isSupported: SUPPORTED_AUDIO_MIME.has(inferredMime),
    },
    file: {
      name:      fileName || null,
      sizeBytes: inferredSizeBytes || null,
      sizeMb:    inferredSizeBytes ? Number((inferredSizeBytes / (1024 * 1024)).toFixed(3)) : null,
      source:    base64 ? 'base64' : url ? 'url' : 'unknown',
      url:       url || null,
    },
    audio: {
      durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : null,
      durationFormatted: typeof durationSeconds === 'number' ? _formatDuration(durationSeconds) : null,
      sampleRate:      typeof sampleRate === 'number' ? sampleRate : null,
      sampleRateLabel: typeof sampleRate === 'number' ? `${sampleRate} Hz` : null,
      channels:        typeof channels === 'number' ? channels : null,
      channelLabel,
      bitrateKbps:     typeof bitrate === 'number' ? bitrate : null,
    },
    quality,
    // Language is a placeholder — no speech recognition
    language: {
      detected:    null,
      placeholder: 'PENDING_SPEECH_RECOGNITION_MODEL',
      confidence:  null,
      note:        'Language detection requires a future plugged-in Speech Recognition model.',
    },
    // Transcript placeholder — no speech-to-text
    transcript: {
      text:     null,
      status:   'PENDING_SPEECH_TO_TEXT_MODEL',
      segments: [],
      note:     'Transcription requires a future plugged-in Speech-to-Text model.',
    },
    recordedAt:  recordedAt || null,
    deviceInfo:  deviceInfo ? _sanitizeDeviceInfo(deviceInfo) : null,
    extractedAt: new Date().toISOString(),
  };
}

// ─── Context Builder ──────────────────────────────────────────────────────────

/**
 * Build a standardized VoiceContext for the Unified Context Builder.
 *
 * @param {object} audioInput - Raw audio input
 * @param {object} [options]
 * @param {string} [options.contextId]     - Unique context identifier
 * @param {string} [options.uploadedBy]    - User ID who uploaded the audio
 * @param {string} [options.purpose]       - 'problem_report' | 'verification' | 'instruction'
 * @param {string} [options.bookingId]     - Associated booking ID
 * @returns {object} Standardized VoiceContext
 */
export function buildVoiceContext(audioInput, options = {}) {
  const validation = validateAudio(audioInput);
  const metadata   = extractMetadata(audioInput);

  const { contextId, uploadedBy, purpose, bookingId } = options;

  return {
    contextType:  'VOICE',
    contextId:    contextId || _generateContextId('voice'),
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
    // Content placeholder — no speech recognition
    contentAnalysis: {
      status:     'PENDING_MODEL',
      transcript: null,
      language:   null,
      intent:     null,
      keywords:   [],
      sentiment:  null,
      note:       'Voice content analysis requires a future plugged-in Speech Recognition model.',
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
  return ext ? (EXT_TO_MIME[ext] || null) : null;
}

function _formatDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function _assessAudioQuality({ sampleRate, channels, bitrate, durationSeconds }) {
  const issues = [];
  let score = 1.0;

  if (sampleRate) {
    if (sampleRate < 8000)  { issues.push('Very low sample rate (below 8 kHz)'); score -= 0.3; }
    else if (sampleRate < 16000) { issues.push('Low sample rate (below 16 kHz)'); score -= 0.1; }
  }

  if (bitrate) {
    if (bitrate < 32) { issues.push('Very low bitrate (below 32 kbps)'); score -= 0.3; }
    else if (bitrate < 64) { issues.push('Low bitrate (below 64 kbps)'); score -= 0.1; }
  }

  if (durationSeconds !== undefined && durationSeconds !== null) {
    if (durationSeconds < 1) { issues.push('Very short audio duration'); score -= 0.2; }
  }

  const normalizedScore = Math.max(0, Math.min(1, score));
  const level = normalizedScore >= 0.8 ? 'HIGH'
    : normalizedScore >= 0.5           ? 'MEDIUM'
    : normalizedScore >= 0.2           ? 'LOW'
    : 'VERY_LOW';

  return { score: normalizedScore, level, issues };
}

function _sanitizeDeviceInfo(deviceInfo) {
  if (!deviceInfo || typeof deviceInfo !== 'object') return null;
  return {
    model:       deviceInfo.model       || null,
    os:          deviceInfo.os          || null,
    osVersion:   deviceInfo.osVersion   || null,
    microphone:  deviceInfo.microphone  || null,
    appVersion:  deviceInfo.appVersion  || null,
  };
}

function _generateContextId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function _emptyMetadata(reason) {
  return {
    format:   { mimeType: null, extension: null, codec: null, isSupported: false },
    file:     { name: null, sizeBytes: null, sizeMb: null, source: 'unknown', url: null },
    audio:    { durationSeconds: null, durationFormatted: null, sampleRate: null, sampleRateLabel: null, channels: null, channelLabel: 'unknown', bitrateKbps: null },
    quality:  { score: 0, level: 'VERY_LOW', issues: [] },
    language: { detected: null, placeholder: 'PENDING_SPEECH_RECOGNITION_MODEL', confidence: null },
    transcript: { text: null, status: 'PENDING_SPEECH_TO_TEXT_MODEL', segments: [] },
    recordedAt:  null,
    deviceInfo:  null,
    extractedAt: new Date().toISOString(),
    _note:       reason,
  };
}
