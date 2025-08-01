// Gestor de Web Workers para procesamiento de imágenes
class ImageWorkerManager {
  constructor() {
    this.worker = null;
    this.pendingTasks = new Map();
    this.taskId = 0;
    this.isReady = false;
    this.init();
  }

  async init() {
    try {
      // Crear el worker
      this.worker = new Worker(new URL('./image-worker.js', import.meta.url), {
        type: 'module'
      });

      // Configurar event listeners
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Esperar a que el worker esté listo
      await this.waitForReady();
      
      console.log('Image Worker Manager inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando Image Worker Manager:', error);
      throw error;
    }
  }

  waitForReady() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando worker'));
      }, 5000);

      const checkReady = (event) => {
        if (event.data.type === 'ready') {
          this.isReady = true;
          clearTimeout(timeout);
          this.worker.removeEventListener('message', checkReady);
          resolve();
        }
      };

      this.worker.addEventListener('message', checkReady);
    });
  }

  handleWorkerMessage(event) {
    const { type, data, id } = event.data;
    
    // Manejar mensaje de inicialización
    if (type === 'ready') {
      this.isReady = true;
      return;
    }
    
    // Verificar que el mensaje tenga ID válido
    if (!id) {
      console.warn('Mensaje del worker sin ID:', event.data);
      return;
    }
    
    const task = this.pendingTasks.get(id);
    if (!task) {
      console.warn('Tarea no encontrada para ID:', id);
      return;
    }

    switch (type) {
      case 'success':
        task.resolve(data);
        this.pendingTasks.delete(id);
        break;

      case 'error':
        task.reject(new Error(data.message));
        this.pendingTasks.delete(id);
        break;

      case 'progress':
        if (task.onProgress) {
          task.onProgress(data);
        }
        break;

      default:
        console.warn('Tipo de mensaje desconocido:', type);
    }
  }

  handleWorkerError(error) {
    console.error('Error en Web Worker:', error);
    // Rechazar todas las tareas pendientes
    this.pendingTasks.forEach((task) => {
      task.reject(new Error('Worker error: ' + error.message));
    });
    this.pendingTasks.clear();
  }

  async executeTask(type, data, onProgress = null) {
    if (!this.isReady) {
      throw new Error('Worker no está listo');
    }

    const id = ++this.taskId;
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(id, { resolve, reject, onProgress });
      
      this.worker.postMessage({
        type,
        data,
        id
      });
    });
  }

  // Métodos de alto nivel para operaciones comunes
  async compressImage(file, options = {}) {
    return this.executeTask('compress', { file, options });
  }

  async resizeImage(imageData, width, height) {
    return this.executeTask('resize', { imageData, width, height });
  }

  async createIcoFile(canvas, sizes) {
    return this.executeTask('createIco', { canvas, sizes });
  }

  async batchCompress(files, options = [], defaultOptions = {}) {
    return this.executeTask('batchCompress', { 
      files, 
      options, 
      defaultOptions 
    });
  }

  // Método para procesar múltiples archivos con progreso
  async processMultipleFiles(files, formatOptions, onProgress = null) {
    const options = files.map(() => formatOptions);
    
    return this.executeTask('batchCompress', {
      files,
      options,
      defaultOptions: formatOptions
    }, onProgress);
  }

  // Limpiar recursos
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingTasks.clear();
    this.isReady = false;
  }

  // Verificar si el worker está disponible
  isWorkerAvailable() {
    return this.isReady && this.worker !== null;
  }

  // Fallback para navegadores que no soportan Web Workers
  static isSupported() {
    return typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';
  }
}

// Exportar la clase
export default ImageWorkerManager; 