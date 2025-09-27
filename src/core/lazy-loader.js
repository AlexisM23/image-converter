// Carga dinámica (lazy loading) de dependencias pesadas
let imageCompression = null;
let ImageWorkerManager = null;
// TOAST UI y Fabric eliminados - ahora usamos sistema nativo

const lazyLoader = {
  async loadImageCompression() {
    if (!imageCompression) {
      const module = await import('browser-image-compression');
      imageCompression = module.default;
    }
    return imageCompression;
  },

  async loadWorkerManager() {
    if (!ImageWorkerManager) {
      const module = await import('../worker-manager.js');
      ImageWorkerManager = module.default;
    }
    return ImageWorkerManager;
  }

  // Métodos de TOAST UI y Fabric eliminados - ahora usamos sistema nativo
};

export default lazyLoader;