/**
 * Filtro de Reducción de Resolución Mejorado
 * Reduce la resolución de la imagen manteniendo la calidad
 * Principio SOLID: Single Responsibility Principle
 * Principio DRY: Usa configuración global centralizada
 */
import { BaseFilter } from './BaseFilter.js';
import { CANVAS_CONFIG } from '../../config/canvas-config.js';

class ResolutionFilter extends BaseFilter {
    constructor() {
        super('resolution', 'resolution', 'Reduce la resolución de la imagen manteniendo la calidad');
        this.scaleFactor = 0.5; // Factor de escala (0.1 - 1.0)
        this.quality = 'high'; // high, medium, low
        this.config = CANVAS_CONFIG.ICO_EXPORT;
    }

    /**
     * Aplicar filtro de reducción de resolución
     * Principio SOLID: Single Responsibility - Solo reduce resolución
     * Principio KISS: Lógica simple sin efectos secundarios
     * @param {HTMLCanvasElement} canvas - Canvas temporal (no se modifica)
     * @param {CanvasRenderingContext2D} context - Contexto temporal (no se modifica)
     * @param {ImageData} imageData - Datos de imagen a procesar
     * @returns {ImageData} - Datos de imagen procesados
     */
    apply(canvas, context, imageData) {
        const { width, height } = imageData;
        const newWidth = Math.round(width * this.scaleFactor);
        const newHeight = Math.round(height * this.scaleFactor);
        
        // Si el factor de escala es 1.0, no hacer nada
        if (this.scaleFactor === 1.0) {
            return imageData;
        }
        
        // Validar dimensiones mínimas
        if (newWidth < 1 || newHeight < 1) {
            console.warn('Dimensiones resultantes muy pequeñas, usando factor mínimo');
            const minScale = Math.max(1 / width, 1 / height);
            this.scaleFactor = minScale;
            return this.apply(canvas, context, imageData);
        }
        
        // Crear canvas temporal completamente aislado para redimensionar
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        
        // Configurar calidad de redimensionado
        this.configureScaling(tempContext);
        
        // Dibujar imagen redimensionada en canvas temporal
        tempContext.drawImage(canvas, 0, 0, width, height, 0, 0, newWidth, newHeight);
        
        // Retornar datos de imagen redimensionada (SIN modificar el canvas original)
        return tempContext.getImageData(0, 0, newWidth, newHeight);
    }

    /**
     * Configurar calidad de redimensionado
     * @param {CanvasRenderingContext2D} context - Contexto del canvas temporal
     */
    configureScaling(context) {
        context.imageSmoothingEnabled = true;
        
        switch (this.quality) {
            case 'high':
                context.imageSmoothingQuality = 'high';
                break;
            case 'medium':
                context.imageSmoothingQuality = 'medium';
                break;
            case 'low':
                context.imageSmoothingQuality = 'low';
                break;
            default:
                context.imageSmoothingQuality = 'high';
        }
    }

    /**
     * Valor por defecto del filtro
     * @returns {number} - Factor de escala por defecto
     */
    getDefaultValue() {
        return 0.5;
    }

    /**
     * Validación de parámetros del filtro usando configuración global
     * @param {number} value - Factor de escala a validar
     * @returns {boolean} - true si el valor es válido
     */
    validate(value) {
        return typeof value === 'number' && 
               value >= this.config.MIN_SCALE_FACTOR && 
               value <= this.config.MAX_SCALE_FACTOR;
    }

    /**
     * Establecer factor de escala usando configuración global
     * @param {number} scaleFactor - Factor de escala
     * @returns {ResolutionFilter} - Instancia del filtro para chaining
     */
    setScaleFactor(scaleFactor) {
        if (this.validate(scaleFactor)) {
            this.scaleFactor = scaleFactor;
        } else {
            console.warn(`Factor de escala inválido: ${scaleFactor}. Debe estar entre ${this.config.MIN_SCALE_FACTOR} y ${this.config.MAX_SCALE_FACTOR}.`);
            this.scaleFactor = Math.max(this.config.MIN_SCALE_FACTOR, Math.min(this.config.MAX_SCALE_FACTOR, scaleFactor));
        }
        return this;
    }

    /**
     * Establecer calidad de redimensionado
     * @param {string} quality - Calidad ('high', 'medium', 'low')
     * @returns {ResolutionFilter} - Instancia del filtro para chaining
     */
    setQuality(quality) {
        const validQualities = ['high', 'medium', 'low'];
        if (validQualities.includes(quality)) {
            this.quality = quality;
        } else {
            console.warn(`Calidad inválida: ${quality}. Usando 'high' por defecto.`);
            this.quality = 'high';
        }
        return this;
    }

    /**
     * Obtener factor de escala actual
     * @returns {number} - Factor de escala actual
     */
    getScaleFactor() {
        return this.scaleFactor;
    }

    /**
     * Obtener calidad actual
     * @returns {string} - Calidad actual
     */
    getQuality() {
        return this.quality;
    }

    /**
     * Aplicar reducción al 50%
     * @returns {ResolutionFilter} - Instancia del filtro para chaining
     */
    setHalfResolution() {
        this.scaleFactor = 0.5;
        return this;
    }

    /**
     * Aplicar reducción al 25%
     * @returns {ResolutionFilter} - Instancia del filtro para chaining
     */
    setQuarterResolution() {
        this.scaleFactor = 0.25;
        return this;
    }

    /**
     * Obtener información específica del filtro
     * @returns {Object} - Información extendida del filtro
     */
    getInfo() {
        return {
            ...super.getInfo(),
            scaleFactor: this.scaleFactor,
            quality: this.quality,
            minScale: 0.1,
            maxScale: 1.0,
            step: 0.05,
            availableQualities: ['high', 'medium', 'low']
        };
    }

    /**
     * Serialización extendida
     * @returns {Object} - Configuración serializada
     */
    serialize() {
        return {
            ...super.serialize(),
            scaleFactor: this.scaleFactor,
            quality: this.quality
        };
    }

    /**
     * Deserialización extendida
     * @param {Object} data - Datos serializados
     * @returns {ResolutionFilter} - Instancia del filtro
     */
    static deserialize(data) {
        const filter = super.deserialize(data);
        if (typeof data.scaleFactor === 'number') {
            filter.setScaleFactor(data.scaleFactor);
        }
        if (typeof data.quality === 'string') {
            filter.setQuality(data.quality);
        }
        return filter;
    }

    /**
     * Resetear a valores por defecto
     * @returns {ResolutionFilter} - Instancia del filtro para chaining
     */
    reset() {
        super.reset();
        this.scaleFactor = 0.5;
        this.quality = 'high';
        return this;
    }
}

export { ResolutionFilter };
