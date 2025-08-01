// Carga dinámica (lazy loading) de dependencias pesadas
let imageCompression = null;
let ImageWorkerManager = null;
let tuiImageEditor = null;
let fabric = null;

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
  },

  async loadToastImageEditor() {
    if (!tuiImageEditor) {
      if (typeof tui !== 'undefined' && tui.ImageEditor) {
        tuiImageEditor = tui.ImageEditor;
      } else {
        throw new Error('TOAST UI Image Editor no está disponible');
      }
    }
    return tuiImageEditor;
  },

  async loadFabric() {
    if (!fabric) {
      const module = await import('fabric');
      fabric = module.fabric;
    }
    return fabric;
  }
};

export default lazyLoader;