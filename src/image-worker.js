// Web Worker para procesamiento de imágenes
// Este worker maneja la compresión y conversión de imágenes sin bloquear el hilo principal

// Importar la librería de compresión de imágenes
import imageCompression from 'browser-image-compression';

// Configuración del worker
const WORKER_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_WIDTH_HEIGHT: 1920,
  MAX_SIZE_MB: 1,
  DEFAULT_QUALITY: 0.9,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
};

// Pool de canvas para reutilización
const canvasPool = {
  pool: [],
  maxSize: 3,
  
  getCanvas(width, height) {
    let canvas = this.pool.find(c => c.width === width && c.height === height);
    if (!canvas) {
      canvas = new OffscreenCanvas(width, height);
    } else {
      this.pool = this.pool.filter(c => c !== canvas);
    }
    return canvas;
  },
  
  returnCanvas(canvas) {
    if (this.pool.length < this.maxSize) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.pool.push(canvas);
    }
  }
};

// Función para redimensionar imagen
async function resizeImage(imageData, width, height) {
  const canvas = canvasPool.getCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Configurar para mejor calidad
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Dibujar imagen redimensionada
  ctx.drawImage(imageData, 0, 0, width, height);
  
  // Convertir a blob
  const blob = await canvas.convertToBlob({ type: 'image/png', quality: 1.0 });
  
  // Devolver canvas al pool
  canvasPool.returnCanvas(canvas);
  
  return blob;
}

// Función para crear icono ICO
async function createIcoFile(canvas, sizes) {
  const icoBlobs = [];
  
  for (const size of sizes) {
    const resizedCanvas = canvasPool.getCanvas(size, size);
    const ctx = resizedCanvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, size, size);
    
    const blob = await resizedCanvas.convertToBlob({ type: 'image/png', quality: 1.0 });
    icoBlobs.push({ size, blob });
    
    canvasPool.returnCanvas(resizedCanvas);
  }
  
  return icoBlobs;
}

// Función principal de compresión
async function compressImage(file, options) {
  try {
    const compressionOptions = {
      maxSizeMB: options.maxSizeMB || WORKER_CONFIG.MAX_SIZE_MB,
      maxWidthOrHeight: options.maxWidthOrHeight || WORKER_CONFIG.MAX_WIDTH_HEIGHT,
      useWebWorker: false, // Ya estamos en un worker
      fileType: options.fileType || file.type,
      quality: options.quality || WORKER_CONFIG.DEFAULT_QUALITY,
      ...options
    };

    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    throw new Error(`Error en compresión: ${error.message}`);
  }
}

// Manejador de mensajes del worker
self.addEventListener('message', async (event) => {
  const { type, data, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'compress':
        result = await compressImage(data.file, data.options);
        break;
        
      case 'resize':
        result = await resizeImage(data.imageData, data.width, data.height);
        break;
        
      case 'createIco':
        result = await createIcoFile(data.canvas, data.sizes);
        break;
        
      case 'batchCompress':
        const results = [];
        for (let i = 0; i < data.files.length; i++) {
          const file = data.files[i];
          const options = data.options[i] || data.defaultOptions;
          
          try {
            const compressed = await compressImage(file, options);
            results.push({ success: true, file: compressed, index: i });
          } catch (error) {
            results.push({ success: false, error: error.message, index: i });
          }
          
          // Reportar progreso
          self.postMessage({
            type: 'progress',
            data: { progress: ((i + 1) / data.files.length) * 100, index: i },
            id
          });
        }
        result = results;
        break;
        
      default:
        throw new Error(`Tipo de operación no soportado: ${type}`);
    }
    
    // Enviar resultado exitoso
    self.postMessage({
      type: 'success',
      data: result,
      id
    });
    
  } catch (error) {
    // Enviar error
    self.postMessage({
      type: 'error',
      data: { message: error.message },
      id
    });
  }
});

// Notificar que el worker está listo
self.postMessage({ type: 'ready', id: 'init' }); 