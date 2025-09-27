/**
 * Modal del Editor Principal
 * Interfaz completa del editor de imágenes
 * Principio SOLID: Single Responsibility Principle
 * Principio KISS: Interfaz clara y funcional
 */
import { IconLibrary } from '../utils/IconLibrary.js';
import { FilterToggle } from './FilterToggle.js';
import { CanvasManager } from '../core/CanvasManager.js';
import { FilterEngine } from '../core/FilterEngine.js';
import { FileContextManager } from '../core/FileContextManager.js';

class EditorModal {
    constructor() {
        this.isOpen = false;
        this.canvasManager = null;
        this.filterEngine = new FilterEngine();
        this.fileContextManager = new FileContextManager();
        this.element = null;
        this.currentFile = null;
        this.currentFileId = null;
        this.currentContext = null;
        this.onSave = null;
        this.onClose = null;
        this.filterToggles = new Map();
        
        this.createElement();
        this.setupEventListeners();
    }

    /**
     * Crear elemento DOM del modal
     */
    createElement() {
        // Modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = this.getBackdropClasses();
        backdrop.id = 'image-editor-modal';

        // Modal content
        const modal = document.createElement('div');
        modal.className = this.getModalClasses();

        // Header
        const header = this.createHeader();
        
        // Content
        const content = this.createContent();

        modal.appendChild(header);
        modal.appendChild(content);
        backdrop.appendChild(modal);

        this.element = backdrop;
    }

    /**
     * Obtener clases CSS del backdrop
     * @returns {string} - Clases CSS
     */
    getBackdropClasses() {
        return 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 opacity-0 invisible transition-all duration-300 ease-in-out';
    }

    /**
     * Obtener clases CSS del modal
     * @returns {string} - Clases CSS
     */
    getModalClasses() {
        return 'bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-h-[95vh] overflow-hidden transform scale-95 transition-transform duration-300 ease-in-out ' +
               'max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-6xl';
    }

    /**
     * Crear header del modal
     * @returns {HTMLElement} - Header del modal
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700';

        const title = document.createElement('h2');
        title.className = 'text-xl font-semibold text-gray-900 dark:text-white';
        title.textContent = 'Editor de Imágenes';

        const actions = document.createElement('div');
        actions.className = 'flex items-center space-x-3';

        // Botón guardar
        const saveButton = this.createSaveButton();

        // Botón cerrar
        const closeButton = this.createCloseButton();

        actions.appendChild(saveButton);
        actions.appendChild(closeButton);

        header.appendChild(title);
        header.appendChild(actions);

        return header;
    }

    /**
     * Crear botón de guardar
     * @returns {HTMLElement} - Botón de guardar
     */
    createSaveButton() {
        const saveButton = document.createElement('button');
        saveButton.className = 'inline-flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200';
        saveButton.innerHTML = IconLibrary.getIcon('save', 20);
        saveButton.setAttribute('title', 'Guardar cambios');
        saveButton.setAttribute('aria-label', 'Guardar cambios');
        saveButton.addEventListener('click', this.handleSave.bind(this));
        return saveButton;
    }

    /**
     * Crear botón de cerrar
     * @returns {HTMLElement} - Botón de cerrar
     */
    createCloseButton() {
        const closeButton = document.createElement('button');
        closeButton.className = 'inline-flex items-center justify-center w-10 h-10 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200';
        closeButton.innerHTML = IconLibrary.getIcon('close', 24);
        closeButton.setAttribute('title', 'Cerrar editor');
        closeButton.setAttribute('aria-label', 'Cerrar editor');
        closeButton.addEventListener('click', this.handleClose.bind(this));
        return closeButton;
    }

    /**
     * Crear contenido del modal
     * @returns {HTMLElement} - Contenido del modal
     */
    createContent() {
        const content = document.createElement('div');
        content.className = 'flex flex-col h-full lg:flex-row lg:min-h-[70vh]';

        // Canvas area responsivo
        const canvasArea = this.createResponsiveCanvasArea();
        
        // Filters panel responsivo
        const filtersPanel = this.createResponsiveFiltersPanel();

        content.appendChild(canvasArea);
        content.appendChild(filtersPanel);

        return content;
    }

    /**
     * Crear área del canvas responsivo
     * @returns {HTMLElement} - Área del canvas
     */
    createResponsiveCanvasArea() {
        const area = document.createElement('div');
        area.className = 'flex-1 p-2 sm:p-4 lg:p-6 flex items-center justify-center ' +
                        'bg-gray-50 dark:bg-gray-800 min-h-[40vh] lg:min-h-[60vh]';

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'relative bg-white rounded-lg shadow-lg p-2 sm:p-4 ' +
                                   'w-full max-w-full';

        const canvas = document.createElement('canvas');
        canvas.id = 'image-editor-canvas';
        canvas.className = 'max-w-full max-h-full object-contain ' +
                          'max-h-[35vh] sm:max-h-[45vh] lg:max-h-[55vh]';

        canvasContainer.appendChild(canvas);
        area.appendChild(canvasContainer);

        return area;
    }

    /**
     * Crear área del canvas (método legacy - mantener para compatibilidad)
     * @returns {HTMLElement} - Área del canvas
     */
    createCanvasArea() {
        return this.createResponsiveCanvasArea();
    }

    /**
     * Crear panel de filtros responsivo
     * @returns {HTMLElement} - Panel de filtros
     */
    createResponsiveFiltersPanel() {
        const panel = document.createElement('div');
        panel.className = 'w-full lg:w-80 bg-gray-50 dark:bg-gray-800 ' +
                         'border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 ' +
                         'p-3 sm:p-4 lg:p-6 overflow-y-auto ' +
                         'max-h-[40vh] lg:max-h-none';

        const title = document.createElement('h3');
        title.className = 'text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4';
        title.textContent = 'Filtros Disponibles';

        const filtersContainer = document.createElement('div');
        filtersContainer.className = 'space-y-2 sm:space-y-3';
        filtersContainer.id = 'filters-container';

        panel.appendChild(title);
        panel.appendChild(filtersContainer);

        return panel;
    }

    /**
     * Crear panel de filtros (método legacy - mantener para compatibilidad)
     * @returns {HTMLElement} - Panel de filtros
     */
    createFiltersPanel() {
        return this.createResponsiveFiltersPanel();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Cerrar al hacer clic en el backdrop
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.handleClose();
            }
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.handleClose();
            }
        });
    }

    /**
     * Abrir modal con archivo
     * @param {File} file - Archivo de imagen
     */
    async open(file) {
        if (!file) {
            throw new Error('EditorModal.open() requiere un archivo válido');
        }

        this.currentFile = file;
        
        try {
            // Generar ID único para el archivo
            this.currentFileId = this.fileContextManager.generateFileId(file);
            
            // Crear o obtener contexto del archivo
            this.currentContext = this.fileContextManager.createContext(this.currentFileId, file);
            this.fileContextManager.setActiveContext(this.currentFileId);
            
            // Inicializar canvas manager
            const canvas = this.element.querySelector('#image-editor-canvas');
            this.canvasManager = new CanvasManager(canvas);
            
            await this.canvasManager.loadImage(file);
            
            // Guardar datos originales en el contexto
            this.currentContext.setOriginalImageData(this.canvasManager.originalImageData);
            
            // Usar el motor de filtros del contexto
            this.filterEngine = this.currentContext.getFilterEngine();
            
            this.renderFilters();
            this.show();
            
            console.log(`Editor abierto para archivo: ${this.currentFileId}`);
        } catch (error) {
            console.error('Error cargando imagen:', error);
            throw error;
        }
    }

    /**
     * Renderizar filtros en el panel
     */
    renderFilters() {
        const container = this.element.querySelector('#filters-container');
        if (!container) return;

        container.innerHTML = '';
        this.filterToggles.clear();

        this.filterEngine.getAllFilters().forEach(filter => {
            const toggle = new FilterToggle(filter, this.handleFilterToggle.bind(this));
            this.filterToggles.set(filter.name, toggle);
            container.appendChild(toggle.getElement());
        });
    }

    /**
     * Manejar toggle de filtro
     * @param {BaseFilter} filter - Filtro que cambió
     * @param {boolean} enabled - Nuevo estado
     */
    async handleFilterToggle(filter, enabled) {
        if (!this.canvasManager || !this.currentContext) return;

        try {
            // Aplicar solo el cambio de estado del filtro específico
            await this.applySingleFilterChange(filter, enabled);
            
            console.log(`Toggle de filtro ${filter.name} aplicado: ${enabled ? 'activado' : 'desactivado'} para archivo: ${this.currentFileId}`);
        } catch (error) {
            console.error('Error aplicando toggle de filtro:', error);
        }
    }

    /**
     * Aplicar solo el cambio de estado de un filtro específico
     * Principio SOLID: Single Responsibility - Solo maneja el cambio de un filtro
     * Principio KISS: Lógica simple y directa
     * @param {BaseFilter} filter - Filtro que cambió de estado
     * @param {boolean} enabled - Nuevo estado del filtro
     */
    async applySingleFilterChange(filter, enabled) {
        if (!this.canvasManager || !this.currentContext) return;

        try {
            // Obtener imagen base (siempre desde la original)
            const originalImageData = this.currentContext.getOriginalImageData();
            if (!originalImageData) {
                console.warn('No hay datos de imagen original disponibles');
                return;
            }

            // Aplicar todos los filtros activos desde la imagen original
            await this.applyAllActiveFiltersFromOriginal(originalImageData);
            
            console.log(`Cambio de filtro ${filter.name} aplicado correctamente`);
            
        } catch (error) {
            console.error(`Error aplicando cambio de filtro ${filter.name}:`, error);
        }
    }

    /**
     * Aplicar todos los filtros activos desde la imagen original con detección de cambios
     * Principio SOLID: Single Responsibility - Solo aplica filtros activos
     * Principio DRY: Reutiliza la lógica de aplicación de filtros
     * @param {ImageData} originalImageData - Datos de imagen original
     */
    async applyAllActiveFiltersFromOriginal(originalImageData) {
        if (!this.canvasManager || !this.currentContext) return;

        try {
            // Obtener filtros activos en orden
            const activeFilters = this.filterEngine.getActiveFilters();
            
            if (activeFilters.length === 0) {
                // Si no hay filtros activos, restaurar imagen original
                this.canvasManager.restoreOriginal();
                this.currentContext.setCurrentImageData(this.currentContext.getOriginalImageData());
                return;
            }

            // Aplicar filtros secuencialmente desde la imagen original
            let currentImageData = this.cloneImageData(originalImageData);
            
            for (const filter of activeFilters) {
                try {
                    console.log(`Aplicando filtro: ${filter.name} a imagen ${currentImageData.width}x${currentImageData.height}`);
                    
                    // Aplicar filtro individual sin modificar el canvas original
                    currentImageData = await this.applyFilterToImageData(filter, currentImageData);
                    
                    console.log(`Resultado de ${filter.name}: ${currentImageData.width}x${currentImageData.height}`);
                    
                } catch (error) {
                    console.error(`Error aplicando filtro ${filter.name}:`, error);
                    // Continuar con el siguiente filtro en caso de error
                }
            }
            
            // Obtener estado actual de filtros para detección de cambios
            const filterState = this.getCurrentFilterState();
            
            // Actualizar canvas con detección de cambios
            const wasUpdated = await this.canvasManager.updateImageData(currentImageData, filterState);
            
            if (wasUpdated) {
                this.currentContext.setCurrentImageData(currentImageData);
                console.log(`Todos los filtros aplicados. Resultado final: ${currentImageData.width}x${currentImageData.height}`);
            } else {
                console.log('No se detectaron cambios reales, manteniendo estado actual');
            }
            
        } catch (error) {
            console.error('Error aplicando filtros desde original:', error);
        }
    }

    /**
     * Aplicar filtros secuencialmente respetando el orden
     * Principio SOLID: Single Responsibility - Solo se encarga de aplicar filtros en orden
     */
    async applyFiltersSequentially() {
        if (!this.canvasManager || !this.currentContext) return;

        try {
            // Obtener imagen base (original o con cambios previos)
            let currentImageData = this.currentContext.getCurrentImageData() || 
                                 this.currentContext.getOriginalImageData();
            
            if (!currentImageData) {
                console.warn('No hay datos de imagen disponibles');
                return;
            }

            // Obtener filtros activos en orden
            const activeFilters = this.filterEngine.getActiveFilters();
            
            if (activeFilters.length === 0) {
                // Si no hay filtros activos, restaurar imagen original
                this.canvasManager.restoreOriginal();
                this.currentContext.setCurrentImageData(this.currentContext.getOriginalImageData());
                return;
            }

            // Aplicar filtros uno por uno en orden secuencial
            for (const filter of activeFilters) {
                try {
                    console.log(`Aplicando filtro: ${filter.name} a imagen ${currentImageData.width}x${currentImageData.height}`);
                    
                    // Aplicar filtro individual
                    currentImageData = await this.applySingleFilter(filter, currentImageData);
                    
                    // Actualizar canvas con resultado intermedio
                    this.canvasManager.updateImageData(currentImageData);
                    
                } catch (error) {
                    console.error(`Error aplicando filtro ${filter.name}:`, error);
                    // Continuar con el siguiente filtro en caso de error
                }
            }
            
            // Guardar resultado final en el contexto
            this.currentContext.setCurrentImageData(currentImageData);
            
            console.log(`Filtros aplicados secuencialmente. Resultado final: ${currentImageData.width}x${currentImageData.height}`);
            
        } catch (error) {
            console.error('Error en aplicación secuencial de filtros:', error);
        }
    }

    /**
     * Aplicar un filtro a ImageData sin modificar el canvas original
     * Principio SOLID: Single Responsibility - Solo aplica filtro a datos
     * Principio KISS: Lógica simple y directa
     * @param {BaseFilter} filter - Filtro a aplicar
     * @param {ImageData} imageData - Datos de imagen a procesar
     * @returns {Promise<ImageData>} - Datos de imagen procesados
     */
    async applyFilterToImageData(filter, imageData) {
        return new Promise((resolve) => {
            // Usar setTimeout para evitar bloqueo del hilo principal
            setTimeout(() => {
                try {
                    // Crear canvas temporal completamente aislado
                    const tempCanvas = document.createElement('canvas');
                    const tempContext = tempCanvas.getContext('2d');
                    
                    // Configurar canvas temporal con dimensiones de los datos
                    tempCanvas.width = imageData.width;
                    tempCanvas.height = imageData.height;
                    
                    // Dibujar imagen en canvas temporal
                    tempContext.putImageData(imageData, 0, 0);
                    
                    // Clonar datos para evitar modificación del original
                    const clonedImageData = this.cloneImageData(imageData);
                    
                    // Aplicar filtro (sin modificar el canvas original)
                    const result = filter.apply(tempCanvas, tempContext, clonedImageData);
                    
                    // Verificar que el resultado es válido
                    if (result && result.width && result.height) {
                        resolve(result);
                    } else {
                        console.warn(`Filtro ${filter.name} no retornó datos válidos, usando datos originales`);
                        resolve(imageData);
                    }
                    
                } catch (error) {
                    console.error(`Error aplicando filtro ${filter.name}:`, error);
                    resolve(imageData); // Devolver datos originales en caso de error
                }
            }, 0);
        });
    }

    /**
     * Clonar ImageData de forma segura
     * Principio SOLID: Single Responsibility - Solo clona datos
     * Principio DRY: Reutilizable para cualquier ImageData
     * @param {ImageData} imageData - Datos a clonar
     * @returns {ImageData} - Clon de los datos
     */
    cloneImageData(imageData) {
        if (!imageData || !imageData.data) {
            throw new Error('ImageData inválido para clonar');
        }
        
        return new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
    }

    /**
     * Aplicar un filtro individual (DEPRECATED - usar applyFilterToImageData)
     * @param {BaseFilter} filter - Filtro a aplicar
     * @param {ImageData} imageData - Datos de imagen actuales
     * @returns {Promise<ImageData>} - Datos de imagen procesados
     */
    async applySingleFilter(filter, imageData) {
        console.warn('applySingleFilter está deprecated. Usar applyFilterToImageData.');
        return this.applyFilterToImageData(filter, imageData);
    }

    /**
     * Manejar guardado con dimensiones reales de la imagen editada
     */
    async handleSave() {
        if (!this.canvasManager) return;

        try {
            // Exportar imagen editada con dimensiones reales (no del canvas)
            const blob = await this.canvasManager.exportEditedImageAsBlob('image/png', 0.9);
            
            if (this.onSave) {
                await this.onSave(blob, this.currentFile);
            }
            
            this.close();
        } catch (error) {
            console.error('Error guardando imagen:', error);
            // Fallback: usar exportación del canvas si falla la exportación de imagen editada
            try {
                console.warn('Fallback: usando exportación del canvas');
                const fallbackBlob = await this.canvasManager.exportAsBlob('image/png', 0.9);
                
                if (this.onSave) {
                    await this.onSave(fallbackBlob, this.currentFile);
                }
                
                this.close();
            } catch (fallbackError) {
                console.error('Error en fallback de guardado:', fallbackError);
            }
        }
    }

    /**
     * Manejar cierre
     */
    handleClose() {
        if (this.onClose) {
            this.onClose();
        }
        this.close();
    }

    /**
     * Mostrar modal
     */
    show() {
        this.isOpen = true;
        document.body.appendChild(this.element);
        document.body.style.overflow = 'hidden';
        
        // Trigger animations
        requestAnimationFrame(() => {
            this.element.classList.remove('opacity-0', 'invisible');
            this.element.classList.add('opacity-100', 'visible');
            
            const modal = this.element.querySelector('.bg-white');
            modal.classList.remove('scale-95');
            modal.classList.add('scale-100');
        });
    }

    /**
     * Cerrar modal
     */
    close() {
        this.isOpen = false;
        document.body.style.overflow = '';
        
        // Limpiar contexto actual si no hay cambios sin guardar
        if (this.currentContext && !this.currentContext.hasUnsavedChanges()) {
            this.fileContextManager.removeContext(this.currentFileId);
        }
        
        // Limpiar referencias
        this.currentFile = null;
        this.currentFileId = null;
        this.currentContext = null;
        
        // Animations
        this.element.classList.add('opacity-0', 'invisible');
        this.element.classList.remove('opacity-100', 'visible');
        
        const modal = this.element.querySelector('.bg-white');
        modal.classList.add('scale-95');
        modal.classList.remove('scale-100');
        
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
    }

    /**
     * Obtener elemento DOM
     * @returns {HTMLElement} - Elemento del modal
     */
    getElement() {
        return this.element;
    }

    /**
     * Verificar si está abierto
     * @returns {boolean} - true si está abierto
     */
    isModalOpen() {
        return this.isOpen;
    }

    /**
     * Destruir modal
     */
    destroy() {
        this.filterToggles.forEach(toggle => toggle.destroy());
        this.filterToggles.clear();
        
        // Limpiar todos los contextos
        this.fileContextManager.clearAllContexts();
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        
        this.isOpen = false;
    }

    /**
     * Obtener gestor de contextos
     * @returns {FileContextManager} - Gestor de contextos
     */
    getFileContextManager() {
        return this.fileContextManager;
    }

    /**
     * Obtener contexto actual
     * @returns {FileContext|null} - Contexto actual
     */
    getCurrentContext() {
        return this.currentContext;
    }

    /**
     * Obtener estado actual de todos los filtros
     * @returns {Object} - Estado de todos los filtros
     */
    getCurrentFilterState() {
        const filterState = {};
        
        this.filterEngine.getAllFilters().forEach(filter => {
            filterState[filter.name] = {
                enabled: filter.enabled,
                value: filter.value
            };
        });
        
        return filterState;
    }

    /**
     * Verificar si hay cambios sin guardar
     * @returns {boolean} - true si hay cambios
     */
    hasUnsavedChanges() {
        if (!this.currentContext) return false;
        return this.currentContext.hasUnsavedChanges();
    }

    /**
     * Obtener información completa del editor
     * @returns {Object} - Información del editor
     */
    getEditorInfo() {
        return {
            isOpen: this.isOpen,
            hasCurrentFile: !!this.currentFile,
            currentFileId: this.currentFileId,
            hasCanvasManager: !!this.canvasManager,
            hasCurrentContext: !!this.currentContext,
            canvasInfo: this.canvasManager ? this.canvasManager.getCanvasInfo() : null,
            filterState: this.getCurrentFilterState(),
            hasUnsavedChanges: this.hasUnsavedChanges()
        };
    }
}

export { EditorModal };
