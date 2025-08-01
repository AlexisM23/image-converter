// Configuración general y de seguridad para la aplicación
const CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 20, // Máximo número de archivos
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'],
  DEFAULT_QUALITY: 0.9,
  MAX_WIDTH_HEIGHT: 1920,
  MAX_SIZE_MB: 1,
  // Configuraciones de seguridad mejoradas
  RATE_LIMIT_DELAY: 1000, // 1 segundo entre conversiones
  MAX_FILE_NAME_LENGTH: 255,
  ALLOWED_FILE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'],
  SECURITY_TIMEOUT: 30000, // 30 segundos máximo por operación
  MAX_PREVIEW_SIZE: 1024 * 1024, // 1MB máximo para previsualización
  // Magic bytes para validación de contenido
  MAGIC_BYTES: {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
    'image/gif': [0x47, 0x49, 0x46],
    'image/bmp': [0x42, 0x4D],
    'image/tiff': [0x49, 0x49, 0x2A, 0x00] // Little-endian
  }
};

export default CONFIG;