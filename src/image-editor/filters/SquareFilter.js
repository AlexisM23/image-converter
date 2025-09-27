/**
 * Filtro de Formato Cuadrado
 * Convierte cualquier imagen a formato cuadrado recortando desde el centro
 * Principio SOLID: Single Responsibility Principle
 */
import { BaseFilter } from './BaseFilter.js';

class SquareFilter extends BaseFilter {
    constructor() {
        super('square', 'square', 'Convierte la imagen a formato cuadrado recortando desde el centro');
        this.cropPosition = 'center'; // center, top, bottom, left, right
    }

    /**
     * Aplicar filtro de formato cuadrado
     * Principio SOLID: Single Responsibility - Solo convierte a formato cuadrado
     * Principio KISS: Lógica simple sin efectos secundarios
     * @param {HTMLCanvasElement} canvas - Canvas temporal (no se modifica)
     * @param {CanvasRenderingContext2D} context - Contexto temporal (no se modifica)
     * @param {ImageData} imageData - Datos de imagen a procesar
     * @returns {ImageData} - Datos de imagen procesados
     */
    apply(canvas, context, imageData) {
        const { width, height } = imageData;
        const minSize = Math.min(width, height);
        
        // Si ya es cuadrado, no hacer nada
        if (width === height) {
            return imageData;
        }
        
        // Crear canvas temporal completamente aislado para el recorte
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        
        tempCanvas.width = minSize;
        tempCanvas.height = minSize;
        
        // Calcular posición de recorte según configuración
        const { startX, startY } = this.calculateCropPosition(width, height, minSize);
        
        // Recortar imagen desde los datos originales
        const croppedImageData = this.extractImageDataRegion(imageData, startX, startY, minSize, minSize);
        
        // Retornar datos de imagen recortada (SIN modificar el canvas original)
        return croppedImageData;
    }

    /**
     * Extraer una región de ImageData
     * Principio SOLID: Single Responsibility - Solo extrae región
     * Principio DRY: Reutilizable para cualquier región
     * @param {ImageData} imageData - Datos de imagen original
     * @param {number} startX - Posición X de inicio
     * @param {number} startY - Posición Y de inicio
     * @param {number} width - Ancho de la región
     * @param {number} height - Alto de la región
     * @returns {ImageData} - Datos de la región extraída
     */
    extractImageDataRegion(imageData, startX, startY, width, height) {
        const originalWidth = imageData.width;
        const originalHeight = imageData.height;
        const resultData = new Uint8ClampedArray(width * height * 4);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sourceX = startX + x;
                const sourceY = startY + y;
                
                // Verificar que estamos dentro de los límites
                if (sourceX >= 0 && sourceX < originalWidth && sourceY >= 0 && sourceY < originalHeight) {
                    const sourceIndex = (sourceY * originalWidth + sourceX) * 4;
                    const targetIndex = (y * width + x) * 4;
                    
                    // Copiar píxel
                    resultData[targetIndex] = imageData.data[sourceIndex];     // R
                    resultData[targetIndex + 1] = imageData.data[sourceIndex + 1]; // G
                    resultData[targetIndex + 2] = imageData.data[sourceIndex + 2]; // B
                    resultData[targetIndex + 3] = imageData.data[sourceIndex + 3]; // A
                }
            }
        }
        
        return new ImageData(resultData, width, height);
    }

    /**
     * Calcular posición de recorte según configuración
     * @param {number} width - Ancho original
     * @param {number} height - Alto original
     * @param {number} minSize - Tamaño mínimo (lado del cuadrado)
     * @returns {Object} - Posición de inicio {startX, startY}
     */
    calculateCropPosition(width, height, minSize) {
        let startX = 0, startY = 0;
        
        switch (this.cropPosition) {
            case 'center':
                startX = Math.floor((width - minSize) / 2);
                startY = Math.floor((height - minSize) / 2);
                break;
            case 'top':
                startX = Math.floor((width - minSize) / 2);
                startY = 0;
                break;
            case 'bottom':
                startX = Math.floor((width - minSize) / 2);
                startY = height - minSize;
                break;
            case 'left':
                startX = 0;
                startY = Math.floor((height - minSize) / 2);
                break;
            case 'right':
                startX = width - minSize;
                startY = Math.floor((height - minSize) / 2);
                break;
            default:
                // Fallback a center
                startX = Math.floor((width - minSize) / 2);
                startY = Math.floor((height - minSize) / 2);
        }
        
        return { startX, startY };
    }

    /**
     * Valor por defecto del filtro
     * @returns {string} - Posición de recorte por defecto
     */
    getDefaultValue() {
        return 'center';
    }

    /**
     * Validación de parámetros del filtro
     * @param {string} value - Posición de recorte a validar
     * @returns {boolean} - true si el valor es válido
     */
    validate(value) {
        const validPositions = ['center', 'top', 'bottom', 'left', 'right'];
        return validPositions.includes(value);
    }

    /**
     * Configurar posición de recorte
     * @param {string} position - Posición de recorte
     * @returns {SquareFilter} - Instancia del filtro para chaining
     */
    setCropPosition(position) {
        if (this.validate(position)) {
            this.cropPosition = position;
        } else {
            console.warn(`Posición de recorte inválida: ${position}. Usando 'center' por defecto.`);
            this.cropPosition = 'center';
        }
        return this;
    }

    /**
     * Obtener información específica del filtro
     * @returns {Object} - Información extendida del filtro
     */
    getInfo() {
        return {
            ...super.getInfo(),
            cropPosition: this.cropPosition,
            availablePositions: ['center', 'top', 'bottom', 'left', 'right']
        };
    }

    /**
     * Serialización extendida
     * @returns {Object} - Configuración serializada
     */
    serialize() {
        return {
            ...super.serialize(),
            cropPosition: this.cropPosition
        };
    }

    /**
     * Deserialización extendida
     * @param {Object} data - Datos serializados
     * @returns {SquareFilter} - Instancia del filtro
     */
    static deserialize(data) {
        const filter = super.deserialize(data);
        if (data.cropPosition) {
            filter.setCropPosition(data.cropPosition);
        }
        return filter;
    }
}

export { SquareFilter };
