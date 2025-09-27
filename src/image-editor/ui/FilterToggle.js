/**
 * Componente Toggle de Filtros
 * Interfaz intuitiva para activar/desactivar filtros
 * Principio SOLID: Single Responsibility Principle
 * Principio KISS: Interfaz simple y clara
 */
import { IconLibrary } from '../utils/IconLibrary.js';

class FilterToggle {
    constructor(filter, onToggle) {
        if (!filter) {
            throw new Error('FilterToggle requiere un filtro válido');
        }
        
        this.filter = filter;
        this.onToggle = onToggle || (() => {});
        this.element = this.createElement();
        this.setupEventListeners();
    }

    /**
     * Crear elemento DOM del toggle
     * @returns {HTMLElement} - Elemento del toggle
     */
    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();
        container.setAttribute('data-filter-name', this.filter.name);

        // Contenedor del icono
        const iconContainer = this.createIconContainer();
        
        // Contenedor de texto
        const textContainer = this.createTextContainer();

        // Toggle switch
        const toggleSwitch = this.createToggleSwitch();

        container.appendChild(iconContainer);
        container.appendChild(textContainer);
        container.appendChild(toggleSwitch);

        return container;
    }

    /**
     * Obtener clases CSS del contenedor
     * @returns {string} - Clases CSS
     */
    getContainerClasses() {
        const baseClasses = 'flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer';
        const stateClasses = this.filter.enabled 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
        
        return `${baseClasses} ${stateClasses}`.trim();
    }

    /**
     * Crear contenedor del icono
     * @returns {HTMLElement} - Contenedor del icono
     */
    createIconContainer() {
        const iconContainer = document.createElement('div');
        iconContainer.className = this.getIconContainerClasses();
        
        const iconElement = IconLibrary.createIconElement(this.filter.icon, 20);
        if (iconElement) {
            iconContainer.appendChild(iconElement);
        } else {
            // Fallback si no se encuentra el icono
            iconContainer.textContent = '?';
        }

        return iconContainer;
    }

    /**
     * Obtener clases CSS del contenedor del icono
     * @returns {string} - Clases CSS
     */
    getIconContainerClasses() {
        const baseClasses = 'flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors';
        const stateClasses = this.filter.enabled 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
        
        return `${baseClasses} ${stateClasses}`.trim();
    }

    /**
     * Crear contenedor de texto
     * @returns {HTMLElement} - Contenedor de texto
     */
    createTextContainer() {
        const textContainer = document.createElement('div');
        textContainer.className = 'flex-1';

        const title = document.createElement('h3');
        title.className = this.getTitleClasses();
        title.textContent = this.getFilterTitle();

        const description = document.createElement('p');
        description.className = 'text-xs sm:text-sm text-gray-500 dark:text-gray-400';
        description.textContent = this.filter.description;

        textContainer.appendChild(title);
        textContainer.appendChild(description);

        return textContainer;
    }

    /**
     * Obtener clases CSS del título
     * @returns {string} - Clases CSS
     */
    getTitleClasses() {
        const baseClasses = 'text-sm sm:text-base font-medium';
        const stateClasses = this.filter.enabled 
            ? 'text-gray-900 dark:text-white' 
            : 'text-gray-700 dark:text-gray-300';
        
        return `${baseClasses} ${stateClasses}`.trim();
    }

    /**
     * Crear toggle switch
     * @returns {HTMLElement} - Toggle switch
     */
    createToggleSwitch() {
        const switchContainer = document.createElement('div');
        switchContainer.className = 'flex-shrink-0';

        const switchElement = document.createElement('button');
        switchElement.className = this.getSwitchClasses();
        switchElement.setAttribute('type', 'button');
        switchElement.setAttribute('aria-label', `Alternar filtro ${this.filter.name}`);

        const switchThumb = document.createElement('span');
        switchThumb.className = this.getSwitchThumbClasses();

        switchElement.appendChild(switchThumb);
        switchContainer.appendChild(switchElement);

        return switchContainer;
    }

    /**
     * Obtener clases CSS del switch
     * @returns {string} - Clases CSS
     */
    getSwitchClasses() {
        const baseClasses = 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
        const stateClasses = this.filter.enabled 
            ? 'bg-blue-600' 
            : 'bg-gray-200 dark:bg-gray-700';
        
        return `${baseClasses} ${stateClasses}`.trim();
    }

    /**
     * Obtener clases CSS del thumb del switch
     * @returns {string} - Clases CSS
     */
    getSwitchThumbClasses() {
        const baseClasses = 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out';
        const stateClasses = this.filter.enabled 
            ? 'translate-x-5' 
            : 'translate-x-0';
        
        return `${baseClasses} ${stateClasses}`.trim();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        this.element.addEventListener('click', this.handleToggle.bind(this));
        
        // Soporte para teclado
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleToggle(e);
            }
        });
        
        // Hacer el elemento focusable
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'switch');
        this.element.setAttribute('aria-checked', this.filter.enabled.toString());
    }

    /**
     * Obtener título del filtro
     * @returns {string} - Título del filtro
     */
    getFilterTitle() {
        const titles = {
            square: 'Formato Cuadrado',
            grayscale: 'Blanco y Negro',
            resolution: 'Resolución 50%',
            brightness: 'Brillo Mejorado',
            contrast: 'Alto Contraste',
            sepia: 'Efecto Sepia',
            vintage: 'Filtro Vintage'
        };
        
        return titles[this.filter.name] || this.filter.name;
    }

    /**
     * Manejar toggle del filtro
     * @param {Event} event - Evento de click
     */
    handleToggle(event) {
        event.stopPropagation();
        
        const wasEnabled = this.filter.enabled;
        this.filter.toggle();
        
        this.updateAppearance();
        this.updateAccessibility();
        
        // Llamar callback
        this.onToggle(this.filter, !wasEnabled);
    }

    /**
     * Actualizar apariencia visual
     */
    updateAppearance() {
        // Actualizar clases del contenedor
        this.element.className = this.getContainerClasses();
        
        // Actualizar icono
        const iconContainer = this.element.querySelector('.w-8, .w-10');
        if (iconContainer) {
            iconContainer.className = this.getIconContainerClasses();
        }
        
        // Actualizar título
        const title = this.element.querySelector('h3');
        if (title) {
            title.className = this.getTitleClasses();
        }
        
        // Actualizar switch
        const switchElement = this.element.querySelector('button');
        const switchThumb = switchElement?.querySelector('span');
        
        if (switchElement) {
            switchElement.className = this.getSwitchClasses();
        }
        
        if (switchThumb) {
            switchThumb.className = this.getSwitchThumbClasses();
        }
    }

    /**
     * Actualizar atributos de accesibilidad
     */
    updateAccessibility() {
        this.element.setAttribute('aria-checked', this.filter.enabled.toString());
    }

    /**
     * Obtener elemento DOM
     * @returns {HTMLElement} - Elemento del toggle
     */
    getElement() {
        return this.element;
    }

    /**
     * Destruir el componente
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Actualizar filtro asociado
     * @param {BaseFilter} newFilter - Nuevo filtro
     */
    updateFilter(newFilter) {
        this.filter = newFilter;
        this.updateAppearance();
        this.updateAccessibility();
    }
}

export { FilterToggle };

