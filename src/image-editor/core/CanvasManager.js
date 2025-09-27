/**
 * Gestor de Canvas Principal Mejorado
 * Responsabilidad única: Gestionar el canvas y operaciones de imagen
 * Principio SOLID: Single Responsibility Principle
 * Principio DRY: Usa configuración global centralizada
 * Principio KISS: API simple y clara
 */
import { getCanvasConfig, getQualityConfig } from '../../config/canvas-config.js';
import { ChangeDetector } from './ChangeDetector.js';

class CanvasManager {
    constructor(canvasElement) {
        if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error('CanvasManager requiere un elemento canvas válido');
        }
        
        this.canvas = canvasElement;
        this.context = canvasElement.getContext('2d');
        this.originalImageData = null;
        this.currentImageData = null;
        this.imageElement = null;
        
        // Configuración global del canvas
        this.canvasConfig = getCanvasConfig('editor');
        this.qualityConfig = getQualityConfig('editor');
        
        // Dimensiones del canvas (desde configuración global)
        this.fixedCanvasWidth = this.canvasConfig.WIDTH;
        this.fixedCanvasHeight = this.canvasConfig.HEIGHT;
        this.maxDisplayWidth = this.canvasConfig.MAX_DISPLAY_WIDTH;
        this.maxDisplayHeight = this.canvasConfig.MAX_DISPLAY_HEIGHT;
        
        // Detector de cambios
        this.changeDetector = new ChangeDetector();
        
        // Configuración de calidad optimizada (desde configuración global)
        this.context.imageSmoothingEnabled = this.qualityConfig.IMAGE_SMOOTHING_ENABLED;
        this.context.imageSmoothingQuality = this.qualityConfig.IMAGE_SMOOTHING_QUALITY;
        
        // Establecer dimensiones fijas del canvas
        this.setFixedCanvasSize();
    }

    /**
     * Establecer dimensiones fijas del canvas
     * Principio SOLID: Single Responsibility - Solo se encarga de configurar el canvas
     */
    setFixedCanvasSize() {
        this.canvas.width = this.fixedCanvasWidth;
        this.canvas.height = this.fixedCanvasHeight;
        this.canvas.style.width = `${this.fixedCanvasWidth}px`;
        this.canvas.style.height = `${this.fixedCanvasHeight}px`;
        
        // Limpiar canvas
        this.clearCanvas();
        
        console.log(`Canvas configurado con dimensiones fijas: ${this.fixedCanvasWidth}x${this.fixedCanvasHeight}`);
    }

    /**
     * Establecer dimensiones responsivas del canvas
     * Principio SOLID: Single Responsibility - Solo se encarga de configurar el canvas responsivo
     * Principio KISS: Lógica simple y directa para cálculos responsivos
     */
    setResponsiveCanvasSize() {
        const container = this.canvas.parentElement;
        if (!container) {
            console.warn('No se encontró contenedor del canvas, usando dimensiones fijas');
            this.setFixedCanvasSize();
            return;
        }

        const containerRect = container.getBoundingClientRect();
        
        // Calcular dimensiones responsivas
        const maxWidth = Math.min(containerRect.width - 32, 800); // 32px padding
        const maxHeight = Math.min(window.innerHeight * 0.6, 600);
        
        // Mantener proporción 4:3 para el canvas
        const aspectRatio = 4/3;
        let canvasWidth = maxWidth;
        let canvasHeight = maxWidth / aspectRatio;
        
        if (canvasHeight > maxHeight) {
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * aspectRatio;
        }
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;
        
        this.clearCanvas();
        console.log(`Canvas responsivo configurado: ${canvasWidth}x${canvasHeight}`);
    }

    /**
     * Configurar redimensionamiento responsivo
     * Principio SOLID: Single Responsibility - Solo maneja el resize responsivo
     */
    setupResponsiveResize() {
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.hasImage()) {
                    this.setResponsiveCanvasSize();
                    this.drawImageScaledAndCentered(this.imageElement);
                }
            }, 250);
        };

        window.addEventListener('resize', handleResize);
        
        // Limpiar listener al destruir
        this.cleanupResize = () => {
            window.removeEventListener('resize', handleResize);
        };
    }

    /**
     * Limpiar canvas completamente
     * Principio SOLID: Single Responsibility - Solo se encarga de limpiar
     */
    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Cargar imagen en el canvas
     * @param {File|string} imageFile - Archivo de imagen o URL
     * @returns {Promise<HTMLImageElement>} - Imagen cargada
     */
    async loadImage(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.imageElement = img;
                
                // Configurar canvas responsivo si está disponible
                if (this.setResponsiveCanvasSize) {
                    this.setResponsiveCanvasSize();
                    this.setupResponsiveResize();
                } else {
                    // Fallback a dimensiones fijas
                    this.setFixedCanvasSize();
                }
                
                // Limpiar canvas completamente
                this.clearCanvas();
                
                // Dibujar imagen escalada y centrada
                this.drawImageScaledAndCentered(img);
                
                // Guardar imagen original para restauración (dimensiones reales)
                this.originalImageData = this.createImageDataFromImage(img);
                this.currentImageData = this.cloneImageData(this.originalImageData);
                
                console.log(`Imagen cargada: ${img.width}x${img.height} en canvas responsivo`);
                resolve(img);
            };
            
            img.onerror = (error) => {
                reject(new Error(`Error cargando imagen: ${error.message || 'Formato no soportado'}`));
            };
            
            if (imageFile instanceof File) {
                img.src = URL.createObjectURL(imageFile);
            } else {
                img.src = imageFile;
            }
        });
    }

    /**
     * Dibujar imagen escalada y centrada en el canvas
     * @param {HTMLImageElement} img - Imagen a dibujar
     */
    drawImageScaledAndCentered(img) {
        // Calcular dimensiones escaladas que quepan en el canvas
        const scale = Math.min(
            this.canvas.width / img.width,
            this.canvas.height / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Calcular posición centrada
        const x = (this.canvas.width - scaledWidth) / 2;
        const y = (this.canvas.height - scaledHeight) / 2;
        
        // Dibujar imagen escalada y centrada
        this.context.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        console.log(`Imagen dibujada: ${scaledWidth}x${scaledHeight} en posición (${x}, ${y})`);
    }

    /**
     * Crear ImageData desde una imagen HTML
     * @param {HTMLImageElement} img - Imagen HTML
     * @returns {ImageData} - Datos de imagen
     */
    createImageDataFromImage(img) {
        // Crear canvas temporal para extraer ImageData
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempContext.drawImage(img, 0, 0);
        
        return tempContext.getImageData(0, 0, img.width, img.height);
    }

    /**
     * Redimensionar canvas manteniendo proporciones (DEPRECATED - usar setFixedCanvasSize)
     * @param {number} width - Ancho
     * @param {number} height - Alto
     */
    resizeCanvas(width, height) {
        console.warn('resizeCanvas está deprecated. Usar setFixedCanvasSize() para dimensiones fijas.');
        // Mantener para compatibilidad, pero usar dimensiones fijas
        this.setFixedCanvasSize();
    }

    /**
     * Clonar ImageData de forma eficiente
     * @param {ImageData} imageData - Datos de imagen a clonar
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
     * Restaurar imagen original
     */
    restoreOriginal() {
        if (this.originalImageData) {
            // Limpiar canvas completamente
            this.clearCanvas();
            
            // Dibujar imagen original escalada y centrada
            this.drawImageDataScaledAndCentered(this.originalImageData);
            
            this.currentImageData = this.cloneImageData(this.originalImageData);
            console.log(`Imagen original restaurada: ${this.originalImageData.width}x${this.originalImageData.height}`);
        }
    }

    /**
     * Actualizar datos de imagen en el canvas con detección de cambios
     * @param {ImageData} newImageData - Nuevos datos de imagen
     * @param {Object} filterState - Estado actual de filtros (opcional)
     * @returns {Promise<boolean>} - true si se actualizó, false si no había cambios
     */
    async updateImageData(newImageData, filterState = null) {
        // Detectar si hay cambios reales
        const currentDimensions = {
            width: newImageData.width,
            height: newImageData.height
        };
        
        const hasChanges = await this.changeDetector.detectChanges(
            newImageData, 
            currentDimensions, 
            filterState || {}
        );
        
        // Si no hay cambios reales, no actualizar
        if (!hasChanges) {
            console.log('CanvasManager: No se detectaron cambios reales, omitiendo actualización');
            return false;
        }
        
        this.currentImageData = newImageData;
        
        // Limpiar canvas completamente
        this.clearCanvas();
        
        // Crear imagen desde ImageData y dibujarla escalada
        this.drawImageDataScaledAndCentered(newImageData);
        
        console.log(`Imagen actualizada: ${newImageData.width}x${newImageData.height} en canvas fijo`);
        return true;
    }

    /**
     * Dibujar ImageData escalada y centrada en el canvas
     * @param {ImageData} imageData - Datos de imagen a dibujar
     */
    drawImageDataScaledAndCentered(imageData) {
        // Crear canvas temporal para ImageData
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempContext.putImageData(imageData, 0, 0);
        
        // Calcular dimensiones escaladas que quepan en el canvas
        const scale = Math.min(
            this.canvas.width / imageData.width,
            this.canvas.height / imageData.height
        );
        
        const scaledWidth = imageData.width * scale;
        const scaledHeight = imageData.height * scale;
        
        // Calcular posición centrada
        const x = (this.canvas.width - scaledWidth) / 2;
        const y = (this.canvas.height - scaledHeight) / 2;
        
        // Dibujar imagen escalada y centrada
        this.context.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);
        
        console.log(`ImageData dibujado: ${scaledWidth}x${scaledHeight} en posición (${x}, ${y})`);
    }

    /**
     * Exportar canvas como Blob con configuración inteligente
     * @param {string} format - Formato de imagen (default: 'image/png')
     * @param {number} quality - Calidad (0-1, default: desde configuración)
     * @returns {Promise<Blob>} - Blob de la imagen
     */
    exportAsBlob(format = 'image/png', quality = null) {
        return new Promise(resolve => {
            // Usar calidad desde configuración si no se especifica
            const exportQuality = quality !== null ? quality : this.qualityConfig.EXPORT_QUALITY;
            this.canvas.toBlob(resolve, format, exportQuality);
        });
    }

    /**
     * Exportar imagen editada con dimensiones reales (no del canvas)
     * @param {string} format - Formato de imagen (default: 'image/png')
     * @param {number} quality - Calidad (0-1, default: desde configuración)
     * @returns {Promise<Blob>} - Blob de la imagen editada
     */
    exportEditedImageAsBlob(format = 'image/png', quality = null) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.currentImageData) {
                    reject(new Error('No hay imagen editada para exportar'));
                    return;
                }

                // Crear canvas temporal con las dimensiones reales de la imagen editada
                const tempCanvas = document.createElement('canvas');
                const tempContext = tempCanvas.getContext('2d');
                
                // Establecer dimensiones reales de la imagen editada
                tempCanvas.width = this.currentImageData.width;
                tempCanvas.height = this.currentImageData.height;
                
                // Configurar calidad
                tempContext.imageSmoothingEnabled = this.qualityConfig.IMAGE_SMOOTHING_ENABLED;
                tempContext.imageSmoothingQuality = this.qualityConfig.IMAGE_SMOOTHING_QUALITY;
                
                // Dibujar imagen editada en el canvas temporal
                tempContext.putImageData(this.currentImageData, 0, 0);
                
                // Usar calidad desde configuración si no se especifica
                const exportQuality = quality !== null ? quality : this.qualityConfig.EXPORT_QUALITY;
                
                // Exportar como blob
                tempCanvas.toBlob((blob) => {
                    if (blob) {
                        console.log(`Imagen editada exportada: ${tempCanvas.width}x${tempCanvas.height} en formato ${format}`);
                        resolve(blob);
                    } else {
                        reject(new Error('Error al crear blob de imagen editada'));
                    }
                }, format, exportQuality);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Exportar canvas como DataURL
     * @param {string} format - Formato de imagen (default: 'image/png')
     * @param {number} quality - Calidad (0-1, default: 0.9)
     * @returns {string} - DataURL de la imagen
     */
    exportAsDataURL(format = 'image/png', quality = 0.9) {
        return this.canvas.toDataURL(format, quality);
    }

    /**
     * Obtener datos de imagen actuales
     * @returns {ImageData} - Datos de imagen del canvas
     */
    getImageData() {
        return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Limpiar canvas
     */
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Obtener dimensiones del canvas
     * @returns {Object} - Objeto con width y height
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    /**
     * Verificar si hay imagen cargada
     * @returns {boolean} - true si hay imagen cargada
     */
    hasImage() {
        return this.originalImageData !== null;
    }

    /**
     * Obtener detector de cambios
     * @returns {ChangeDetector} - Detector de cambios
     */
    getChangeDetector() {
        return this.changeDetector;
    }

    /**
     * Resetear detector de cambios
     */
    resetChangeDetector() {
        this.changeDetector.reset();
    }

    /**
     * Obtener configuración del canvas
     * @returns {Object} - Configuración del canvas
     */
    getCanvasConfig() {
        return this.canvasConfig;
    }

    /**
     * Obtener información completa del canvas
     * @returns {Object} - Información del canvas
     */
    getCanvasInfo() {
        return {
            dimensions: {
                width: this.canvas.width,
                height: this.canvas.height,
                fixedWidth: this.fixedCanvasWidth,
                fixedHeight: this.fixedCanvasHeight,
                maxDisplayWidth: this.maxDisplayWidth,
                maxDisplayHeight: this.maxDisplayHeight
            },
            hasOriginalImage: this.originalImageData !== null,
            hasCurrentImage: this.currentImageData !== null,
            originalDimensions: this.originalImageData ? {
                width: this.originalImageData.width,
                height: this.originalImageData.height
            } : null,
            currentDimensions: this.currentImageData ? {
                width: this.currentImageData.width,
                height: this.currentImageData.height
            } : null,
            changeDetector: this.changeDetector.getInfo(),
            config: this.canvasConfig
        };
    }
}

export { CanvasManager };
