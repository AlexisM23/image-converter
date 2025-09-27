/**
 * Índice Principal del Sistema de Editor de Imágenes
 * Punto de entrada para el sistema completo
 * Principio DRY: Centraliza las exportaciones
 */

// Core
export { CanvasManager } from './core/CanvasManager.js';
export { FilterEngine } from './core/FilterEngine.js';

// Filters
export { BaseFilter } from './filters/BaseFilter.js';
export { SquareFilter } from './filters/SquareFilter.js';
export { GrayscaleFilter } from './filters/GrayscaleFilter.js';
export { ResolutionFilter } from './filters/ResolutionFilter.js';

// UI Components
export { FilterToggle } from './ui/FilterToggle.js';
export { EditorModal } from './ui/EditorModal.js';

// Utils
export { IconLibrary } from './utils/IconLibrary.js';

// Importaciones para uso interno
import { EditorModal } from './ui/EditorModal.js';
import { FilterEngine } from './core/FilterEngine.js';
import { FileContextManager } from './core/FileContextManager.js';

/**
 * Clase principal del sistema de editor
 * Facilita la integración con el sistema existente
 */
class ImageEditorSystem {
    constructor() {
        this.editorModal = new EditorModal();
        this.filterEngine = new FilterEngine();
        this.isInitialized = false;
    }

    /**
     * Inicializar el sistema
     */
    initialize() {
        if (this.isInitialized) {
            console.warn('ImageEditorSystem ya está inicializado');
            return;
        }

        this.isInitialized = true;
        console.log('ImageEditorSystem inicializado correctamente');
    }

    /**
     * Abrir editor con archivo
     * @param {File} file - Archivo de imagen
     * @returns {Promise<void>}
     */
    async openEditor(file) {
        if (!this.isInitialized) {
            this.initialize();
        }

        await this.editorModal.open(file);
    }

    /**
     * Configurar callbacks del editor
     * @param {Object} callbacks - Callbacks de configuración
     */
    configureCallbacks(callbacks) {
        if (callbacks.onSave) {
            this.editorModal.onSave = callbacks.onSave;
        }
        if (callbacks.onClose) {
            this.editorModal.onClose = callbacks.onClose;
        }
    }

    /**
     * Obtener estadísticas del sistema
     * @returns {Object} - Estadísticas del sistema
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            isModalOpen: this.editorModal.isModalOpen(),
            filterStats: this.filterEngine.getStats(),
            contextStats: this.editorModal.getFileContextManager().getStats()
        };
    }

    /**
     * Limpiar contexto de un archivo específico
     * @param {string} fileId - ID del archivo
     * @returns {boolean} - true si se limpió correctamente
     */
    clearFileContext(fileId) {
        return this.editorModal.getFileContextManager().removeContext(fileId);
    }

    /**
     * Obtener gestor de contextos
     * @returns {FileContextManager} - Gestor de contextos
     */
    getFileContextManager() {
        return this.editorModal.getFileContextManager();
    }

    /**
     * Destruir el sistema
     */
    destroy() {
        this.editorModal.destroy();
        this.filterEngine.cleanup();
        this.isInitialized = false;
    }
}

export { ImageEditorSystem };
