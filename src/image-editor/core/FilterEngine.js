/**
 * Motor de Filtros
 * Orquesta la aplicación de filtros de forma secuencial y segura
 * Principio SOLID: Open/Closed Principle + Single Responsibility
 * Principio DRY: Evita duplicación en la gestión de filtros
 */
import { BaseFilter } from '../filters/BaseFilter.js';
import { SquareFilter, GrayscaleFilter, ResolutionFilter } from '../filters/index.js';

class FilterEngine {
    constructor() {
        this.filters = new Map();
        this.filterOrder = [];
        this.isProcessing = false;
        this.initializeDefaultFilters();
    }

    /**
     * Inicialización de filtros por defecto
     * Principio DRY: Centraliza la creación de filtros
     */
    initializeDefaultFilters() {
        const defaultFilters = [
            new SquareFilter(),
            new GrayscaleFilter(),
            new ResolutionFilter()
        ];

        defaultFilters.forEach(filter => {
            this.registerFilter(filter);
        });
    }

    /**
     * Registro dinámico de filtros
     * Principio SOLID: Open/Closed - Extensible sin modificar código existente
     * @param {BaseFilter} filter - Filtro a registrar
     * @throws {Error} Si el filtro no extiende de BaseFilter
     */
    registerFilter(filter) {
        if (!(filter instanceof BaseFilter)) {
            throw new Error('El filtro debe extender de BaseFilter');
        }
        
        this.filters.set(filter.name, filter);
        
        if (!this.filterOrder.includes(filter.name)) {
            this.filterOrder.push(filter.name);
        }
    }

    /**
     * Aplicación secuencial de filtros activos
     * @param {HTMLCanvasElement} canvas - Canvas donde aplicar filtros
     * @param {CanvasRenderingContext2D} context - Contexto del canvas
     * @param {ImageData} originalImageData - Datos de imagen original
     * @returns {Promise<ImageData>} - Datos de imagen procesados
     */
    async applyFilters(canvas, context, originalImageData) {
        if (this.isProcessing) {
            console.warn('Ya hay un procesamiento en curso');
            return originalImageData;
        }

        this.isProcessing = true;
        
        try {
            let currentImageData = this.cloneImageData(originalImageData);
            
            // Aplicar filtros en orden secuencial
            for (const filterName of this.filterOrder) {
                const filter = this.filters.get(filterName);
                
                if (filter && filter.enabled) {
                    try {
                        console.log(`FilterEngine: Aplicando ${filterName} a imagen ${currentImageData.width}x${currentImageData.height}`);
                        currentImageData = await this.applyFilterSafe(filter, canvas, context, currentImageData);
                        console.log(`FilterEngine: Resultado de ${filterName}: ${currentImageData.width}x${currentImageData.height}`);
                    } catch (error) {
                        console.error(`Error aplicando filtro ${filterName}:`, error);
                        // Continuar con el siguiente filtro en caso de error
                    }
                }
            }
            
            return currentImageData;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Aplicación segura de filtros con manejo de errores
     * @param {BaseFilter} filter - Filtro a aplicar
     * @param {HTMLCanvasElement} canvas - Canvas
     * @param {CanvasRenderingContext2D} context - Contexto
     * @param {ImageData} imageData - Datos de imagen
     * @returns {Promise<ImageData>} - Datos procesados
     */
    async applyFilterSafe(filter, canvas, context, imageData) {
        return new Promise((resolve) => {
            // Usar setTimeout para evitar bloqueo del hilo principal
            setTimeout(() => {
                try {
                    const result = filter.apply(canvas, context, imageData);
                    resolve(result || imageData);
                } catch (error) {
                    console.error(`Error en filtro ${filter.name}:`, error);
                    resolve(imageData); // Devolver imagen original en caso de error
                }
            }, 0);
        });
    }

    /**
     * Clonar ImageData de forma eficiente
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
     * Obtener filtro por nombre
     * @param {string} name - Nombre del filtro
     * @returns {BaseFilter|undefined} - Filtro encontrado
     */
    getFilter(name) {
        return this.filters.get(name);
    }

    /**
     * Alternar estado de un filtro
     * @param {string} name - Nombre del filtro
     * @returns {boolean} - Nuevo estado del filtro
     */
    toggleFilter(name) {
        const filter = this.filters.get(name);
        if (filter) {
            return filter.toggle();
        }
        return false;
    }

    /**
     * Habilitar filtro
     * @param {string} name - Nombre del filtro
     * @returns {boolean} - true si se habilitó exitosamente
     */
    enableFilter(name) {
        const filter = this.filters.get(name);
        if (filter) {
            filter.enable();
            return true;
        }
        return false;
    }

    /**
     * Deshabilitar filtro
     * @param {string} name - Nombre del filtro
     * @returns {boolean} - true si se deshabilitó exitosamente
     */
    disableFilter(name) {
        const filter = this.filters.get(name);
        if (filter) {
            filter.disable();
            return true;
        }
        return false;
    }

    /**
     * Obtener todos los filtros activos
     * @returns {BaseFilter[]} - Array de filtros activos
     */
    getActiveFilters() {
        return Array.from(this.filters.values()).filter(filter => filter.enabled);
    }

    /**
     * Obtener todos los filtros
     * @returns {BaseFilter[]} - Array de todos los filtros
     */
    getAllFilters() {
        return Array.from(this.filters.values());
    }

    /**
     * Obtener filtros por estado
     * @param {boolean} enabled - Estado deseado
     * @returns {BaseFilter[]} - Array de filtros con el estado especificado
     */
    getFiltersByState(enabled) {
        return Array.from(this.filters.values()).filter(filter => filter.enabled === enabled);
    }

    /**
     * Verificar si hay filtros activos
     * @returns {boolean} - true si hay filtros activos
     */
    hasActiveFilters() {
        return this.getActiveFilters().length > 0;
    }

    /**
     * Deshabilitar todos los filtros
     */
    disableAllFilters() {
        this.filters.forEach(filter => {
            filter.disable();
        });
    }

    /**
     * Habilitar todos los filtros
     */
    enableAllFilters() {
        this.filters.forEach(filter => {
            filter.enable();
        });
    }

    /**
     * Resetear todos los filtros a valores por defecto
     */
    resetAllFilters() {
        this.filters.forEach(filter => {
            filter.reset();
        });
    }

    /**
     * Reordenar filtros
     * @param {string[]} newOrder - Nuevo orden de filtros
     */
    reorderFilters(newOrder) {
        // Validar que todos los filtros existan
        const validOrder = newOrder.filter(name => this.filters.has(name));
        
        if (validOrder.length === newOrder.length) {
            this.filterOrder = validOrder;
        } else {
            console.warn('Algunos filtros en el nuevo orden no existen');
        }
    }

    /**
     * Exportar configuración actual
     * @returns {Object} - Configuración serializada
     */
    exportConfig() {
        const config = {
            filterOrder: [...this.filterOrder],
            filters: {}
        };
        
        this.filters.forEach((filter, name) => {
            config.filters[name] = filter.serialize();
        });
        
        return config;
    }

    /**
     * Importar configuración
     * @param {Object} config - Configuración a importar
     */
    importConfig(config) {
        if (config.filterOrder) {
            this.reorderFilters(config.filterOrder);
        }
        
        if (config.filters) {
            Object.entries(config.filters).forEach(([name, filterConfig]) => {
                const filter = this.filters.get(name);
                if (filter) {
                    filter.enabled = filterConfig.enabled || false;
                    filter.value = filterConfig.value || filter.getDefaultValue();
                }
            });
        }
    }

    /**
     * Obtener estadísticas del motor
     * @returns {Object} - Estadísticas del motor
     */
    getStats() {
        const totalFilters = this.filters.size;
        const activeFilters = this.getActiveFilters().length;
        
        return {
            totalFilters,
            activeFilters,
            inactiveFilters: totalFilters - activeFilters,
            isProcessing: this.isProcessing,
            filterOrder: [...this.filterOrder]
        };
    }

    /**
     * Verificar si el motor está procesando
     * @returns {boolean} - true si está procesando
     */
    isEngineProcessing() {
        return this.isProcessing;
    }

    /**
     * Limpiar recursos del motor
     */
    cleanup() {
        this.filters.clear();
        this.filterOrder = [];
        this.isProcessing = false;
    }

    /**
     * Resetear todos los filtros a estado inicial
     * Útil para limpiar estado entre archivos
     */
    resetToInitialState() {
        this.filters.forEach(filter => {
            filter.reset();
        });
        this.isProcessing = false;
    }

    /**
     * Aplicar filtros con contexto específico
     * @param {HTMLCanvasElement} canvas - Canvas donde aplicar filtros
     * @param {CanvasRenderingContext2D} context - Contexto del canvas
     * @param {ImageData} originalImageData - Datos de imagen original
     * @param {Object} contextInfo - Información del contexto (opcional)
     * @returns {Promise<ImageData>} - Datos de imagen procesados
     */
    async applyFiltersWithContext(canvas, context, originalImageData, contextInfo = {}) {
        if (this.isProcessing) {
            console.warn('Ya hay un procesamiento en curso');
            return originalImageData;
        }

        this.isProcessing = true;
        
        try {
            let currentImageData = this.cloneImageData(originalImageData);
            
            // Aplicar filtros en orden secuencial
            for (const filterName of this.filterOrder) {
                const filter = this.filters.get(filterName);
                
                if (filter && filter.enabled) {
                    try {
                        console.log(`FilterEngine: Aplicando ${filterName} en contexto ${contextInfo.fileId || 'unknown'} a imagen ${currentImageData.width}x${currentImageData.height}`);
                        currentImageData = await this.applyFilterSafe(filter, canvas, context, currentImageData);
                        console.log(`FilterEngine: Resultado de ${filterName}: ${currentImageData.width}x${currentImageData.height}`);
                    } catch (error) {
                        console.error(`Error aplicando filtro ${filterName} en contexto ${contextInfo.fileId || 'unknown'}:`, error);
                        // Continuar con el siguiente filtro en caso de error
                    }
                }
            }
            
            return currentImageData;
        } finally {
            this.isProcessing = false;
        }
    }
}

export { FilterEngine };
