// Configuración específica por formato de imagen
const FORMAT_CONFIGS = {
  'image/jpeg': {
    name: 'JPEG',
    extension: 'jpg',
    quality: { min: 10, max: 100, default: 90 },
    options: {
      quality: { label: 'Calidad', min: 10, max: 100, default: 90 },
      progressive: { label: 'Progresivo', default: true },
      optimizeCoding: { label: 'Optimizar codificación', default: true }
    }
  },
  'image/png': {
    name: 'PNG',
    extension: 'png',
    options: {
      compressionLevel: { label: 'Nivel de compresión', min: 0, max: 9, default: 6 },
      interlaced: { label: 'Entrelazado', default: false }
    }
  },
  'image/webp': {
    name: 'WebP',
    extension: 'webp',
    quality: { min: 10, max: 100, default: 85 },
    options: {
      quality: { label: 'Calidad', min: 10, max: 100, default: 85 },
      lossless: { label: 'Sin pérdida', default: false },
      nearLossless: { label: 'Casi sin pérdida', default: false }
    }
  },
  'image/gif': {
    name: 'GIF',
    extension: 'gif',
    options: {
      dither: { label: 'Dithering', default: true },
      colors: { label: 'Número de colores', min: 2, max: 256, default: 256 }
    }
  },
  'image/bmp': {
    name: 'BMP',
    extension: 'bmp',
    options: {
      bitDepth: { label: 'Profundidad de bits', options: [8, 16, 24, 32], default: 24 }
    }
  },
  'image/ico': {
    name: 'ICO',
    extension: 'ico',
    options: {
      sizes: {
        label: 'Tamaños de icono',
        options: [16, 32, 48, 64, 128, 256],
        default: [16, 32, 48, 64, 128],
        multiple: true,
        type: 'checkbox'
      }
    },
    hiddenSizes: [8]
  },
  'image/avif': {
    name: 'AVIF',
    extension: 'avif',
    quality: { min: 10, max: 100, default: 80 },
    options: {
      quality: { label: 'Calidad', min: 10, max: 100, default: 80 },
      speed: { label: 'Velocidad de codificación', min: 0, max: 10, default: 6 },
      chromaSubsampling: { label: 'Submuestreo de croma', options: ['4:4:4', '4:2:2', '4:2:0'], default: '4:2:0' }
    }
  },
  'image/tiff': {
    name: 'TIFF',
    extension: 'tiff',
    quality: { min: 10, max: 100, default: 90 },
    options: {
      quality: { label: 'Calidad', min: 10, max: 100, default: 90 },
      compression: { label: 'Compresión', options: ['none', 'lzw', 'deflate'], default: 'lzw' },
      bitDepth: { label: 'Profundidad de bits', options: [8, 16, 24, 32], default: 24 }
    }
  }
};

export default FORMAT_CONFIGS;