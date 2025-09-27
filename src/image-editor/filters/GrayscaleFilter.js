/**
 * Filtro de Escala de Grises
 * Convierte la imagen a blanco y negro con control de intensidad
 * Principio SOLID: Single Responsibility Principle
 */
import { BaseFilter } from './BaseFilter.js';

class GrayscaleFilter extends BaseFilter {
    constructor() {
        super('grayscale', 'grayscale', 'Convierte la imagen a blanco y negro con control de intensidad');
        this.intensity = 1.0; // 0 = sin efecto, 1 = completamente gris
    }

    /**
     * Aplicar filtro de escala de grises
     * Principio SOLID: Single Responsibility - Solo convierte a escala de grises
     * Principio KISS: Lógica simple sin efectos secundarios
     * @param {HTMLCanvasElement} canvas - Canvas temporal (no se modifica)
     * @param {CanvasRenderingContext2D} context - Contexto temporal (no se modifica)
     * @param {ImageData} imageData - Datos de imagen a procesar
     * @returns {ImageData} - Datos de imagen procesados
     */
    apply(canvas, context, imageData) {
        const intensity = Math.max(0, Math.min(1, this.intensity));
        
        // Si la intensidad es 0, no aplicar filtro
        if (intensity === 0) {
            return imageData;
        }
        
        // Clonar datos para evitar modificar el original
        const clonedData = new Uint8ClampedArray(imageData.data);
        
        for (let i = 0; i < clonedData.length; i += 4) {
            const r = clonedData[i];
            const g = clonedData[i + 1];
            const b = clonedData[i + 2];
            
            // Fórmula luminance estándar (ITU-R BT.709)
            const gray = Math.round(
                0.2126 * r +     // Red
                0.7152 * g +     // Green
                0.0722 * b       // Blue
            );
            
            // Aplicar intensidad del filtro
            clonedData[i] = Math.round(r * (1 - intensity) + gray * intensity);     // Red
            clonedData[i + 1] = Math.round(g * (1 - intensity) + gray * intensity); // Green
            clonedData[i + 2] = Math.round(b * (1 - intensity) + gray * intensity); // Blue
            // Alpha se mantiene igual: clonedData[i + 3]
        }
        
        // Retornar nuevos datos de imagen (SIN modificar el canvas original)
        return new ImageData(clonedData, imageData.width, imageData.height);
    }

    /**
     * Valor por defecto del filtro
     * @returns {number} - Intensidad por defecto
     */
    getDefaultValue() {
        return 1.0;
    }

    /**
     * Validación de parámetros del filtro
     * @param {number} value - Intensidad a validar
     * @returns {boolean} - true si el valor es válido
     */
    validate(value) {
        return typeof value === 'number' && value >= 0 && value <= 1;
    }

    /**
     * Establecer intensidad del filtro
     * @param {number} intensity - Intensidad (0-1)
     * @returns {GrayscaleFilter} - Instancia del filtro para chaining
     */
    setIntensity(intensity) {
        if (this.validate(intensity)) {
            this.intensity = intensity;
        } else {
            console.warn(`Intensidad inválida: ${intensity}. Debe estar entre 0 y 1.`);
            this.intensity = Math.max(0, Math.min(1, intensity));
        }
        return this;
    }

    /**
     * Obtener intensidad actual
     * @returns {number} - Intensidad actual
     */
    getIntensity() {
        return this.intensity;
    }

    /**
     * Aplicar filtro completo (intensidad 1.0)
     * @returns {GrayscaleFilter} - Instancia del filtro para chaining
     */
    applyFull() {
        this.intensity = 1.0;
        return this;
    }

    /**
     * Aplicar filtro parcial (intensidad 0.5)
     * @returns {GrayscaleFilter} - Instancia del filtro para chaining
     */
    applyPartial() {
        this.intensity = 0.5;
        return this;
    }

    /**
     * Obtener información específica del filtro
     * @returns {Object} - Información extendida del filtro
     */
    getInfo() {
        return {
            ...super.getInfo(),
            intensity: this.intensity,
            minIntensity: 0,
            maxIntensity: 1,
            step: 0.1
        };
    }

    /**
     * Serialización extendida
     * @returns {Object} - Configuración serializada
     */
    serialize() {
        return {
            ...super.serialize(),
            intensity: this.intensity
        };
    }

    /**
     * Deserialización extendida
     * @param {Object} data - Datos serializados
     * @returns {GrayscaleFilter} - Instancia del filtro
     */
    static deserialize(data) {
        const filter = super.deserialize(data);
        if (typeof data.intensity === 'number') {
            filter.setIntensity(data.intensity);
        }
        return filter;
    }

    /**
     * Resetear a valores por defecto
     * @returns {GrayscaleFilter} - Instancia del filtro para chaining
     */
    reset() {
        super.reset();
        this.intensity = 1.0;
        return this;
    }
}

export { GrayscaleFilter };
