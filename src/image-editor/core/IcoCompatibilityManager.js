/**
 * Gestor de Compatibilidad con .ICO
 * Maneja la compatibilidad entre resoluciones del editor y tamaños .ico
 * Principio SOLID: Single Responsibility - Solo maneja compatibilidad .ico
 * Principio DRY: Centraliza lógica de compatibilidad
 * Principio KISS: API simple y clara
 */
import { getCompatibleIcoSizes, isResolutionCompatibleWithIco } from '../../config/canvas-config.js';

class IcoCompatibilityManager {
    constructor() {
        this.currentEditorResolution = 1.0;
        this.compatibleSizes = [];
        this.exportConfig = null;
    }

    /**
     * Configurar resolución actual del editor
     * @param {number} resolution - Resolución actual (0.1 - 1.0)
     */
    setEditorResolution(resolution) {
        this.currentEditorResolution = Math.max(0.1, Math.min(1.0, resolution));
        this.updateCompatibleSizes();
        console.log(`IcoCompatibilityManager: Resolución del editor establecida a ${this.currentEditorResolution}`);
    }

    /**
     * Actualizar tamaños compatibles con .ico
     */
    updateCompatibleSizes() {
        this.compatibleSizes = getCompatibleIcoSizes(this.currentEditorResolution);
        console.log(`IcoCompatibilityManager: Tamaños compatibles: ${this.compatibleSizes.join(', ')}`);
    }

    /**
     * Obtener tamaños .ico compatibles con la resolución actual
     * @returns {number[]} - Array de tamaños compatibles
     */
    getCompatibleSizes() {
        return [...this.compatibleSizes];
    }

    /**
     * Verificar si la resolución actual es compatible con .ico
     * @returns {boolean} - true si es compatible
     */
    isCompatible() {
        return isResolutionCompatibleWithIco(this.currentEditorResolution);
    }

    /**
     * Obtener configuración de exportación .ico optimizada
     * @param {Object} originalConfig - Configuración original
     * @returns {Object} - Configuración optimizada
     */
    getOptimizedExportConfig(originalConfig = {}) {
        const optimizedConfig = {
            ...originalConfig,
            sizes: this.compatibleSizes,
            resolution: this.currentEditorResolution,
            compatible: this.isCompatible()
        };

        // Si no es compatible, usar tamaños por defecto
        if (!optimizedConfig.compatible) {
            optimizedConfig.sizes = [16, 32, 48, 64, 128];
            console.warn('IcoCompatibilityManager: Resolución no compatible, usando tamaños por defecto');
        }

        this.exportConfig = optimizedConfig;
        return optimizedConfig;
    }

    /**
     * Calcular factor de escala para un tamaño .ico específico
     * @param {number} icoSize - Tamaño del icono .ico
     * @param {number} originalSize - Tamaño original de la imagen
     * @returns {number} - Factor de escala
     */
    calculateScaleFactor(icoSize, originalSize) {
        const targetSize = icoSize;
        const scaleFactor = targetSize / originalSize;
        
        console.log(`IcoCompatibilityManager: Factor de escala para ${icoSize}x${icoSize}: ${scaleFactor.toFixed(3)}`);
        return scaleFactor;
    }

    /**
     * Obtener información de compatibilidad
     * @returns {Object} - Información de compatibilidad
     */
    getCompatibilityInfo() {
        return {
            currentResolution: this.currentEditorResolution,
            compatibleSizes: this.compatibleSizes,
            isCompatible: this.isCompatible(),
            exportConfig: this.exportConfig,
            resolutionPercentage: Math.round(this.currentEditorResolution * 100)
        };
    }

    /**
     * Validar configuración de exportación .ico
     * @param {Object} config - Configuración a validar
     * @returns {Object} - Resultado de validación
     */
    validateExportConfig(config) {
        const result = {
            valid: true,
            warnings: [],
            errors: [],
            optimizedConfig: null
        };

        // Validar que hay tamaños especificados
        if (!config.sizes || !Array.isArray(config.sizes) || config.sizes.length === 0) {
            result.errors.push('No se especificaron tamaños para exportación .ico');
            result.valid = false;
        }

        // Validar tamaños individuales
        if (config.sizes) {
            config.sizes.forEach(size => {
                if (typeof size !== 'number' || size < 1 || size > 512) {
                    result.errors.push(`Tamaño inválido: ${size}. Debe ser un número entre 1 y 512`);
                    result.valid = false;
                }
            });
        }

        // Verificar compatibilidad con resolución actual
        if (!this.isCompatible()) {
            result.warnings.push(`Resolución actual (${this.currentEditorResolution}) no es óptima para .ico`);
        }

        // Generar configuración optimizada si es válida
        if (result.valid) {
            result.optimizedConfig = this.getOptimizedExportConfig(config);
        }

        return result;
    }

    /**
     * Obtener recomendaciones de resolución para .ico
     * @returns {Object} - Recomendaciones
     */
    getResolutionRecommendations() {
        const recommendations = {
            current: {
                resolution: this.currentEditorResolution,
                compatible: this.isCompatible(),
                compatibleSizes: this.compatibleSizes
            },
            optimal: {
                resolution: 1.0,
                compatible: true,
                compatibleSizes: [16, 32, 48, 64, 128, 256]
            },
            alternatives: [
                {
                    resolution: 0.5,
                    compatible: true,
                    compatibleSizes: [16, 32, 48, 64],
                    description: 'Resolución 50% - Ideal para iconos pequeños'
                },
                {
                    resolution: 0.25,
                    compatible: true,
                    compatibleSizes: [16, 32],
                    description: 'Resolución 25% - Solo para iconos muy pequeños'
                }
            ]
        };

        return recommendations;
    }

    /**
     * Resetear gestor de compatibilidad
     */
    reset() {
        this.currentEditorResolution = 1.0;
        this.compatibleSizes = [];
        this.exportConfig = null;
        this.updateCompatibleSizes();
        console.log('IcoCompatibilityManager: Estado reseteado');
    }
}

export { IcoCompatibilityManager };
