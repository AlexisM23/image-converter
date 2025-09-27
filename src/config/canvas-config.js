/**
 * Configuración Global del Sistema de Canvas
 * Principio SOLID: Single Responsibility - Solo maneja configuración de canvas
 * Principio DRY: Centraliza todas las configuraciones de canvas
 * Principio KISS: Configuración simple y clara
 */

// Configuración base del canvas del editor
export const CANVAS_CONFIG = {
    // Dimensiones fijas del canvas del editor
    EDITOR_CANVAS: {
        WIDTH: 800,
        HEIGHT: 600,
        MAX_DISPLAY_WIDTH: 750,
        MAX_DISPLAY_HEIGHT: 550
    },
    
    // Configuración de calidad
    QUALITY: {
        IMAGE_SMOOTHING_ENABLED: true,
        IMAGE_SMOOTHING_QUALITY: 'high',
        EXPORT_QUALITY: 0.9
    },
    
    // Configuración de exportación .ico
    ICO_EXPORT: {
        // Tamaños estándar de iconos
        STANDARD_SIZES: [16, 32, 48, 64, 128, 256],
        // Tamaños ocultos (se incluyen automáticamente)
        HIDDEN_SIZES: [8],
        // Tamaños por defecto para exportación
        DEFAULT_SIZES: [16, 32, 48, 64, 128],
        // Factor de escala máximo para .ico
        MAX_SCALE_FACTOR: 1.0,
        // Factor de escala mínimo para .ico
        MIN_SCALE_FACTOR: 0.1
    },
    
    // Configuración de detección de cambios
    CHANGE_DETECTION: {
        // Tolerancia para considerar que no hay cambios (en píxeles)
        PIXEL_TOLERANCE: 0,
        // Tolerancia para dimensiones (en píxeles)
        DIMENSION_TOLERANCE: 0,
        // Habilitar detección automática de cambios
        AUTO_DETECTION_ENABLED: true,
        // Tiempo de debounce para detección (ms)
        DEBOUNCE_TIME: 100
    },
    
    // Configuración de capas
    LAYERS: {
        // Separar canvas de visualización del canvas de datos
        SEPARATE_CANVAS_LAYERS: true,
        // Canvas de visualización (solo para mostrar)
        VISUALIZATION_CANVAS: {
            WIDTH: 800,
            HEIGHT: 600
        },
        // Canvas de datos (para procesamiento)
        DATA_CANVAS: {
            // Se ajusta dinámicamente según la imagen
            DYNAMIC_SIZING: true
        }
    }
};

// Configuración de resoluciones compatibles con .ico
export const RESOLUTION_CONFIG = {
    // Mapeo de resoluciones del editor a tamaños .ico
    EDITOR_TO_ICO_MAPPING: {
        // Resolución 50% del editor → tamaños .ico compatibles
        0.5: [16, 32, 48, 64],
        // Resolución 25% del editor → tamaños .ico compatibles
        0.25: [16, 32],
        // Resolución 100% del editor → todos los tamaños .ico
        1.0: [16, 32, 48, 64, 128, 256]
    },
    
    // Configuración de escalado inteligente
    SMART_SCALING: {
        // Habilitar escalado inteligente
        ENABLED: true,
        // Mantener proporciones
        MAINTAIN_ASPECT_RATIO: true,
        // Algoritmo de escalado
        ALGORITHM: 'lanczos', // 'lanczos', 'bicubic', 'bilinear'
        // Calidad de escalado
        QUALITY: 'high'
    }
};

// Configuración de validación
export const VALIDATION_CONFIG = {
    // Validación de dimensiones
    DIMENSIONS: {
        MIN_WIDTH: 1,
        MIN_HEIGHT: 1,
        MAX_WIDTH: 4096,
        MAX_HEIGHT: 4096
    },
    
    // Validación de formatos
    FORMATS: {
        SUPPORTED_INPUT: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
        SUPPORTED_OUTPUT: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/ico']
    }
};

// Función para obtener configuración de canvas según el contexto
export function getCanvasConfig(context = 'editor') {
    switch (context) {
        case 'editor':
            return CANVAS_CONFIG.EDITOR_CANVAS;
        case 'ico-export':
            return CANVAS_CONFIG.ICO_EXPORT;
        case 'visualization':
            return CANVAS_CONFIG.LAYERS.VISUALIZATION_CANVAS;
        case 'data':
            return CANVAS_CONFIG.LAYERS.DATA_CANVAS;
        default:
            return CANVAS_CONFIG.EDITOR_CANVAS;
    }
}

// Función para obtener tamaños .ico compatibles con una resolución del editor
export function getCompatibleIcoSizes(editorResolution) {
    const mapping = RESOLUTION_CONFIG.EDITOR_TO_ICO_MAPPING;
    
    // Buscar la resolución más cercana
    const resolutions = Object.keys(mapping).map(Number).sort((a, b) => b - a);
    const closestResolution = resolutions.find(res => res <= editorResolution) || resolutions[resolutions.length - 1];
    
    return mapping[closestResolution] || CANVAS_CONFIG.ICO_EXPORT.DEFAULT_SIZES;
}

// Función para validar si una resolución es compatible con .ico
export function isResolutionCompatibleWithIco(editorResolution) {
    const compatibleSizes = getCompatibleIcoSizes(editorResolution);
    return compatibleSizes.length > 0;
}

// Función para obtener configuración de calidad según el contexto
export function getQualityConfig(context = 'editor') {
    const baseQuality = CANVAS_CONFIG.QUALITY;
    
    switch (context) {
        case 'export':
            return {
                ...baseQuality,
                EXPORT_QUALITY: 0.95
            };
        case 'preview':
            return {
                ...baseQuality,
                EXPORT_QUALITY: 0.8
            };
        default:
            return baseQuality;
    }
}

export default {
    CANVAS_CONFIG,
    RESOLUTION_CONFIG,
    VALIDATION_CONFIG,
    getCanvasConfig,
    getCompatibleIcoSizes,
    isResolutionCompatibleWithIco,
    getQualityConfig
};
