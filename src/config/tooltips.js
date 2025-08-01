// Descripciones de tooltips para las opciones de formato
const TOOLTIP_DESCRIPTIONS = {
  progressive: 'Mejora la carga progresiva de la imagen, permitiendo una visualización gradual durante la descarga',
  optimizeCoding: 'Optimiza la codificación Huffman para lograr mejor compresión sin pérdida de calidad',
  // Agregar más descripciones específicas
  'Progresivo': 'Mejora la carga progresiva de la imagen, permitiendo una visualización gradual durante la descarga',
  'Optimizar codificación': 'Optimiza la codificación Huffman para lograr mejor compresión sin pérdida de calidad',
  compressionLevel: 'Nivel de compresión PNG (0-9). Mayor valor = más compresión pero proceso más lento',
  interlaced: 'Carga la imagen de forma entrelazada, mostrando una versión de baja resolución primero',
  lossless: 'Compresión sin pérdida de calidad. Mantiene todos los detalles originales',
  nearLossless: 'Compresión casi sin pérdida. Calidad muy alta con compresión moderada',
  dither: 'Aplica dithering para mejorar la calidad visual en imágenes con paleta limitada',
  colors: 'Número de colores en la paleta. Menos colores = archivo más pequeño',
  bitDepth: 'Profundidad de bits por píxel. Mayor profundidad = más colores disponibles',
  sizes: 'Tamaños de icono para generar. Múltiples tamaños se incluyen en un archivo ZIP',
  speed: 'Velocidad de codificación (0-10). Menor valor = más lento pero mejor calidad',
  chromaSubsampling: 'Método de submuestreo de color. 4:4:4 = mejor calidad, 4:2:0 = mejor compresión',
  compression: 'Tipo de compresión TIFF. LZW = buena compresión, Deflate = mejor compresión'
};

export default TOOLTIP_DESCRIPTIONS;