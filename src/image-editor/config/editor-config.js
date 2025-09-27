/**
 * Configuración del Sistema de Editor de Imágenes
 * Centraliza todas las configuraciones del sistema
 */

export const EDITOR_CONFIG = {
  // Configuración de canvas
  canvas: {
    defaultQuality: 0.9,
    maxWidth: 4096,
    maxHeight: 4096,
    imageSmoothing: {
      enabled: true,
      quality: 'high'
    }
  },

  // Configuración de filtros
  filters: {
    // Filtro de formato cuadrado
    square: {
      defaultPosition: 'center',
      availablePositions: ['center', 'top', 'bottom', 'left', 'right']
    },

    // Filtro de escala de grises
    grayscale: {
      defaultIntensity: 1.0,
      minIntensity: 0,
      maxIntensity: 1,
      step: 0.1
    },

    // Filtro de resolución
    resolution: {
      defaultScale: 0.5,
      minScale: 0.1,
      maxScale: 1.0,
      step: 0.05,
      defaultQuality: 'high',
      availableQualities: ['high', 'medium', 'low']
    }
  },

  // Configuración de UI
  ui: {
    modal: {
      maxWidth: '6xl',
      maxHeight: '90vh',
      animationDuration: 300
    },
    
    toggle: {
      animationDuration: 200,
      iconSize: 20
    },

    icons: {
      defaultSize: 24,
      sizes: [16, 20, 24, 32, 48]
    }
  },

  // Configuración de rendimiento
  performance: {
    // Procesar en Web Worker para imágenes grandes
    workerThreshold: 2000000, // 2MP
    
    // Timeout para operaciones
    operationTimeout: 30000, // 30 segundos
    
    // Cache de filtros aplicados
    enableCache: true,
    maxCacheSize: 10
  },

  // Configuración de accesibilidad
  accessibility: {
    // Soporte para lectores de pantalla
    screenReaderSupport: true,
    
    // Navegación por teclado
    keyboardNavigation: true,
    
    // Contraste mínimo
    minContrast: 4.5
  },

  // Configuración de temas
  themes: {
    light: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827'
    },
    
    dark: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb'
    }
  },

  // Configuración de validación
  validation: {
    // Tipos de archivo soportados
    supportedTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ],

    // Tamaño máximo de archivo (10MB)
    maxFileSize: 10 * 1024 * 1024,

    // Dimensiones máximas
    maxDimensions: {
      width: 8192,
      height: 8192
    }
  },

  // Configuración de errores
  errors: {
    // Mostrar errores en consola
    logToConsole: true,
    
    // Mostrar notificaciones de error
    showNotifications: true,
    
    // Timeout para notificaciones (5 segundos)
    notificationTimeout: 5000
  }
};

/**
 * Obtener configuración por clave
 * @param {string} key - Clave de configuración (ej: 'canvas.defaultQuality')
 * @returns {*} - Valor de configuración
 */
export function getConfig(key) {
  const keys = key.split('.');
  let value = EDITOR_CONFIG;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Establecer configuración por clave
 * @param {string} key - Clave de configuración
 * @param {*} value - Nuevo valor
 */
export function setConfig(key, value) {
  const keys = key.split('.');
  const lastKey = keys.pop();
  let target = EDITOR_CONFIG;
  
  for (const k of keys) {
    if (!target[k] || typeof target[k] !== 'object') {
      target[k] = {};
    }
    target = target[k];
  }
  
  target[lastKey] = value;
}

/**
 * Validar configuración
 * @returns {Object} - Resultado de validación
 */
export function validateConfig() {
  const errors = [];
  const warnings = [];
  
  // Validar configuración de canvas
  if (EDITOR_CONFIG.canvas.defaultQuality < 0 || EDITOR_CONFIG.canvas.defaultQuality > 1) {
    errors.push('canvas.defaultQuality debe estar entre 0 y 1');
  }
  
  // Validar configuración de filtros
  if (EDITOR_CONFIG.filters.grayscale.defaultIntensity < 0 || EDITOR_CONFIG.filters.grayscale.defaultIntensity > 1) {
    errors.push('filters.grayscale.defaultIntensity debe estar entre 0 y 1');
  }
  
  if (EDITOR_CONFIG.filters.resolution.defaultScale < 0.1 || EDITOR_CONFIG.filters.resolution.defaultScale > 1) {
    errors.push('filters.resolution.defaultScale debe estar entre 0.1 y 1');
  }
  
  // Validar configuración de rendimiento
  if (EDITOR_CONFIG.performance.workerThreshold < 100000) {
    warnings.push('performance.workerThreshold es muy bajo, puede afectar el rendimiento');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default EDITOR_CONFIG;

