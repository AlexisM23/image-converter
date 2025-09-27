/**
 * Gestor de Contexto por Archivo
 * Asocia cada archivo con su propio contexto de filtros y estado
 * Principio SOLID: Single Responsibility + Open/Closed Principle
 * Principio DRY: Evita duplicación de lógica de contexto
 * Principio KISS: Interfaz simple y clara
 */
import { FilterEngine } from './FilterEngine.js';

class FileContextManager {
    constructor() {
        this.contexts = new Map(); // fileId -> FileContext
        this.activeContextId = null;
    }

    /**
     * Crear contexto para un archivo
     * @param {string} fileId - ID único del archivo
     * @param {File} file - Archivo de imagen
     * @returns {FileContext} - Contexto creado
     */
    createContext(fileId, file) {
        if (this.contexts.has(fileId)) {
            console.warn(`Contexto ya existe para archivo ${fileId}`);
            return this.contexts.get(fileId);
        }

        const context = new FileContext(fileId, file);
        this.contexts.set(fileId, context);
        
        console.log(`Contexto creado para archivo: ${fileId}`);
        return context;
    }

    /**
     * Obtener contexto de un archivo
     * @param {string} fileId - ID único del archivo
     * @returns {FileContext|null} - Contexto del archivo o null
     */
    getContext(fileId) {
        return this.contexts.get(fileId) || null;
    }

    /**
     * Establecer contexto activo
     * @param {string} fileId - ID único del archivo
     * @returns {boolean} - true si se estableció correctamente
     */
    setActiveContext(fileId) {
        const context = this.getContext(fileId);
        if (!context) {
            console.warn(`No se encontró contexto para archivo ${fileId}`);
            return false;
        }

        this.activeContextId = fileId;
        console.log(`Contexto activo establecido: ${fileId}`);
        return true;
    }

    /**
     * Obtener contexto activo
     * @returns {FileContext|null} - Contexto activo o null
     */
    getActiveContext() {
        if (!this.activeContextId) {
            return null;
        }
        return this.getContext(this.activeContextId);
    }

    /**
     * Eliminar contexto de un archivo
     * @param {string} fileId - ID único del archivo
     * @returns {boolean} - true si se eliminó correctamente
     */
    removeContext(fileId) {
        const context = this.contexts.get(fileId);
        if (!context) {
            return false;
        }

        // Limpiar recursos del contexto
        context.cleanup();
        
        // Eliminar del mapa
        this.contexts.delete(fileId);
        
        // Si era el contexto activo, limpiarlo
        if (this.activeContextId === fileId) {
            this.activeContextId = null;
        }

        console.log(`Contexto eliminado para archivo: ${fileId}`);
        return true;
    }

    /**
     * Verificar si existe contexto para un archivo
     * @param {string} fileId - ID único del archivo
     * @returns {boolean} - true si existe
     */
    hasContext(fileId) {
        return this.contexts.has(fileId);
    }

    /**
     * Obtener todos los contextos
     * @returns {Map} - Mapa de contextos
     */
    getAllContexts() {
        return new Map(this.contexts);
    }

    /**
     * Limpiar todos los contextos
     */
    clearAllContexts() {
        this.contexts.forEach(context => context.cleanup());
        this.contexts.clear();
        this.activeContextId = null;
        console.log('Todos los contextos eliminados');
    }

    /**
     * Obtener estadísticas del gestor
     * @returns {Object} - Estadísticas
     */
    getStats() {
        return {
            totalContexts: this.contexts.size,
            activeContextId: this.activeContextId,
            hasActiveContext: !!this.activeContextId
        };
    }

    /**
     * Generar ID único para archivo
     * @param {File} file - Archivo
     * @returns {string} - ID único
     */
    generateFileId(file) {
        // Usar timestamp + tamaño + nombre para generar ID único
        const timestamp = Date.now();
        const size = file.size;
        const name = file.name;
        const lastModified = file.lastModified;
        
        return `${timestamp}_${size}_${lastModified}_${name}`.replace(/[^a-zA-Z0-9_]/g, '_');
    }
}

/**
 * Contexto de archivo individual
 * Mantiene el estado de filtros y configuración para un archivo específico
 */
class FileContext {
    constructor(fileId, file) {
        this.fileId = fileId;
        this.file = file;
        this.filterEngine = new FilterEngine();
        this.originalImageData = null;
        this.currentImageData = null;
        this.lastModified = Date.now();
        this.isDirty = false; // Indica si hay cambios sin guardar
    }

    /**
     * Obtener motor de filtros del contexto
     * @returns {FilterEngine} - Motor de filtros
     */
    getFilterEngine() {
        return this.filterEngine;
    }

    /**
     * Establecer datos de imagen original
     * @param {ImageData} imageData - Datos de imagen original
     */
    setOriginalImageData(imageData) {
        this.originalImageData = imageData;
        this.currentImageData = this.cloneImageData(imageData);
    }

    /**
     * Obtener datos de imagen original
     * @returns {ImageData|null} - Datos de imagen original
     */
    getOriginalImageData() {
        return this.originalImageData;
    }

    /**
     * Establecer datos de imagen actual
     * @param {ImageData} imageData - Datos de imagen actual
     */
    setCurrentImageData(imageData) {
        this.currentImageData = imageData;
        this.isDirty = true;
        this.lastModified = Date.now();
    }

    /**
     * Obtener datos de imagen actual
     * @returns {ImageData|null} - Datos de imagen actual
     */
    getCurrentImageData() {
        return this.currentImageData;
    }

    /**
     * Restaurar imagen original
     */
    restoreOriginal() {
        if (this.originalImageData) {
            this.currentImageData = this.cloneImageData(this.originalImageData);
            this.isDirty = false;
            this.lastModified = Date.now();
        }
    }

    /**
     * Clonar ImageData
     * @param {ImageData} imageData - Datos a clonar
     * @returns {ImageData} - Clon de los datos
     */
    cloneImageData(imageData) {
        return new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
    }

    /**
     * Verificar si hay cambios sin guardar
     * @returns {boolean} - true si hay cambios
     */
    hasUnsavedChanges() {
        return this.isDirty;
    }

    /**
     * Marcar como guardado
     */
    markAsSaved() {
        this.isDirty = false;
    }

    /**
     * Obtener información del contexto
     * @returns {Object} - Información del contexto
     */
    getInfo() {
        return {
            fileId: this.fileId,
            fileName: this.file.name,
            fileSize: this.file.size,
            fileType: this.file.type,
            lastModified: this.lastModified,
            isDirty: this.isDirty,
            hasOriginalData: !!this.originalImageData,
            hasCurrentData: !!this.currentImageData,
            activeFilters: this.filterEngine.getActiveFilters().length
        };
    }

    /**
     * Limpiar recursos del contexto
     */
    cleanup() {
        this.filterEngine.cleanup();
        this.originalImageData = null;
        this.currentImageData = null;
        this.isDirty = false;
    }
}

export { FileContextManager, FileContext };

