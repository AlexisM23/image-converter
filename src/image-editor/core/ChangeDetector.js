/**
 * Detector de Cambios Inteligente
 * Detecta si se han realizado cambios reales en la imagen
 * Principio SOLID: Single Responsibility - Solo detecta cambios
 * Principio DRY: Lógica centralizada de detección
 * Principio KISS: API simple y clara
 */
import { CANVAS_CONFIG } from '../../config/canvas-config.js';

class ChangeDetector {
    constructor() {
        this.lastImageData = null;
        this.lastDimensions = null;
        this.lastFilterState = null;
        this.debounceTimer = null;
        this.config = CANVAS_CONFIG.CHANGE_DETECTION;
    }

    /**
     * Detectar si hay cambios reales en la imagen
     * @param {ImageData} currentImageData - Datos de imagen actuales
     * @param {Object} currentDimensions - Dimensiones actuales
     * @param {Object} currentFilterState - Estado actual de filtros
     * @returns {Promise<boolean>} - true si hay cambios reales
     */
    async detectChanges(currentImageData, currentDimensions, currentFilterState) {
        return new Promise((resolve) => {
            // Cancelar timer anterior si existe
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }

            // Aplicar debounce
            this.debounceTimer = setTimeout(() => {
                const hasChanges = this.performChangeDetection(
                    currentImageData, 
                    currentDimensions, 
                    currentFilterState
                );
                resolve(hasChanges);
            }, this.config.DEBOUNCE_TIME);
        });
    }

    /**
     * Realizar detección de cambios
     * @param {ImageData} currentImageData - Datos de imagen actuales
     * @param {Object} currentDimensions - Dimensiones actuales
     * @param {Object} currentFilterState - Estado actual de filtros
     * @returns {boolean} - true si hay cambios reales
     */
    performChangeDetection(currentImageData, currentDimensions, currentFilterState) {
        // Si es la primera vez, no hay cambios
        if (!this.lastImageData || !this.lastDimensions || !this.lastFilterState) {
            this.updateLastState(currentImageData, currentDimensions, currentFilterState);
            return false;
        }

        // Verificar cambios en dimensiones
        const dimensionChanged = this.detectDimensionChanges(currentDimensions);
        if (dimensionChanged) {
            console.log('ChangeDetector: Cambios detectados en dimensiones');
            this.updateLastState(currentImageData, currentDimensions, currentFilterState);
            return true;
        }

        // Verificar cambios en estado de filtros
        const filterStateChanged = this.detectFilterStateChanges(currentFilterState);
        if (filterStateChanged) {
            console.log('ChangeDetector: Cambios detectados en estado de filtros');
            this.updateLastState(currentImageData, currentDimensions, currentFilterState);
            return true;
        }

        // Verificar cambios en datos de imagen (solo si es necesario)
        if (this.config.AUTO_DETECTION_ENABLED) {
            const imageDataChanged = this.detectImageDataChanges(currentImageData);
            if (imageDataChanged) {
                console.log('ChangeDetector: Cambios detectados en datos de imagen');
                this.updateLastState(currentImageData, currentDimensions, currentFilterState);
                return true;
            }
        }

        console.log('ChangeDetector: No se detectaron cambios reales');
        return false;
    }

    /**
     * Detectar cambios en dimensiones
     * @param {Object} currentDimensions - Dimensiones actuales
     * @returns {boolean} - true si hay cambios
     */
    detectDimensionChanges(currentDimensions) {
        if (!this.lastDimensions) return true;

        const widthDiff = Math.abs(currentDimensions.width - this.lastDimensions.width);
        const heightDiff = Math.abs(currentDimensions.height - this.lastDimensions.height);

        return widthDiff > this.config.DIMENSION_TOLERANCE || 
               heightDiff > this.config.DIMENSION_TOLERANCE;
    }

    /**
     * Detectar cambios en estado de filtros
     * @param {Object} currentFilterState - Estado actual de filtros
     * @returns {boolean} - true si hay cambios
     */
    detectFilterStateChanges(currentFilterState) {
        if (!this.lastFilterState) return true;

        // Comparar estado de cada filtro
        for (const [filterName, currentState] of Object.entries(currentFilterState)) {
            const lastState = this.lastFilterState[filterName];
            
            if (!lastState || currentState.enabled !== lastState.enabled) {
                return true;
            }

            // Comparar valores si existen
            if (currentState.value !== undefined && lastState.value !== undefined) {
                if (currentState.value !== lastState.value) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Detectar cambios en datos de imagen (comparación de píxeles)
     * @param {ImageData} currentImageData - Datos de imagen actuales
     * @returns {boolean} - true si hay cambios
     */
    detectImageDataChanges(currentImageData) {
        if (!this.lastImageData) return true;

        // Verificar dimensiones primero
        if (currentImageData.width !== this.lastImageData.width || 
            currentImageData.height !== this.lastImageData.height) {
            return true;
        }

        // Comparar datos de píxeles (muestreo para eficiencia)
        const sampleRate = Math.max(1, Math.floor(currentImageData.data.length / 10000)); // Muestrear 1 de cada N píxeles
        
        for (let i = 0; i < currentImageData.data.length; i += sampleRate * 4) {
            const currentPixel = currentImageData.data.slice(i, i + 4);
            const lastPixel = this.lastImageData.data.slice(i, i + 4);
            
            // Comparar cada canal (RGBA)
            for (let j = 0; j < 4; j++) {
                const diff = Math.abs(currentPixel[j] - lastPixel[j]);
                if (diff > this.config.PIXEL_TOLERANCE) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Actualizar estado anterior
     * @param {ImageData} imageData - Datos de imagen
     * @param {Object} dimensions - Dimensiones
     * @param {Object} filterState - Estado de filtros
     */
    updateLastState(imageData, dimensions, filterState) {
        // Clonar datos de imagen para evitar referencias
        if (imageData) {
            this.lastImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
        }

        // Clonar dimensiones
        this.lastDimensions = { ...dimensions };

        // Clonar estado de filtros
        this.lastFilterState = JSON.parse(JSON.stringify(filterState));
    }

    /**
     * Resetear detector de cambios
     */
    reset() {
        this.lastImageData = null;
        this.lastDimensions = null;
        this.lastFilterState = null;
        
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        
        console.log('ChangeDetector: Estado reseteado');
    }

    /**
     * Verificar si hay estado previo
     * @returns {boolean} - true si hay estado previo
     */
    hasPreviousState() {
        return this.lastImageData !== null && 
               this.lastDimensions !== null && 
               this.lastFilterState !== null;
    }

    /**
     * Obtener información del detector
     * @returns {Object} - Información del detector
     */
    getInfo() {
        return {
            hasPreviousState: this.hasPreviousState(),
            config: this.config,
            lastDimensions: this.lastDimensions,
            lastFilterState: this.lastFilterState
        };
    }

    /**
     * Configurar detector
     * @param {Object} newConfig - Nueva configuración
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('ChangeDetector: Configuración actualizada', this.config);
    }
}

export { ChangeDetector };
