import state from '../core/state.js';
import eventHandlers from '../handlers/event-handlers.js';
import utils from '../utils/utils.js';

const elements = {};

const init = async () => {
  // Inicializar elementos del DOM
  elements.fileInput = document.getElementById('fileInput');
  elements.dropZone = document.getElementById('dropZone');
  elements.formatSelect = document.getElementById('formatSelect');
  elements.convertButton = document.getElementById('convertButton');
  elements.errorMessage = document.getElementById('errorMessage');
  elements.errorText = document.getElementById('errorText');
  elements.loading = document.getElementById('loading');
  elements.formatOptions = document.getElementById('formatOptions');
  elements.fileList = document.getElementById('fileList');
  elements.fileListContainer = document.getElementById('fileListContainer');
  elements.darkModeToggle = document.getElementById('darkModeToggle');
  elements.moonIcon = document.getElementById('moonIcon');
  elements.sunIcon = document.getElementById('sunIcon');

  // Verificar que los elementos críticos existen
  console.log('Elementos encontrados:', {
    fileInput: !!elements.fileInput,
    dropZone: !!elements.dropZone,
    formatSelect: !!elements.formatSelect,
    formatOptions: !!elements.formatOptions
  });

  // Inicializar modo oscuro
  utils.initDarkMode(elements);

  // Inicializar sistema de editor de imágenes nativo (opcional)
  try {
    eventHandlers.initializeImageEditor();
  } catch (error) {
    console.warn('No se pudo inicializar el sistema de editor:', error);
  }

  // Limpiar memoria al cargar la página
  // (memoryManager.cleanup() se puede llamar aquí si se importa)

  // Event listeners para archivos
  elements.fileInput.addEventListener('change', (e) => eventHandlers.handleFileSelect(e, state, elements));
  elements.dropZone.addEventListener('click', () => {
    console.log('DropZone clickeado, abriendo selector de archivos');
    elements.fileInput.click();
  });
  elements.dropZone.addEventListener('drop', (e) => eventHandlers.handleDrop(e, state, elements));
  elements.dropZone.addEventListener('dragover', (e) => eventHandlers.handleDragOver(e, elements));
  elements.dropZone.addEventListener('dragleave', (e) => eventHandlers.handleDragLeave(e, elements));

  // Event listeners para controles
  elements.convertButton.addEventListener('click', () => eventHandlers.convertImage(state, elements));
  elements.formatSelect.addEventListener('change', () => eventHandlers.updateFormatOptions(state, elements));
  elements.darkModeToggle.addEventListener('click', () => utils.toggleDarkMode(elements));

  // Inicializar opciones de formato
  eventHandlers.updateFormatOptions(state, elements);

  // Prevenir navegación por defecto en drop zone
  elements.dropZone.addEventListener('dragover', (e) => e.preventDefault());
  elements.dropZone.addEventListener('drop', (e) => e.preventDefault());

  // Limpiar memoria al salir de la página
  window.addEventListener('beforeunload', () => {
    // memoryManager.cleanup();
    if (state.workerManager) {
      state.workerManager.terminate();
    }
    // Limpiar sistema de editor
    if (eventHandlers.imageEditorSystem) {
      eventHandlers.imageEditorSystem.destroy();
    }
  });

  // Manejo de errores global
  window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    utils.showError('Error interno del sistema', elements);
  });

  // Manejo de promesas rechazadas no capturadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no capturada:', event.reason);
    utils.showError('Error en operación asíncrona', elements);
  });
};

export { init, elements };