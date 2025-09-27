/**
 * Sistema Unificado de Iconos
 * Principio SOLID: Single Responsibility Principle
 * Principio DRY: Centraliza todos los iconos en un lugar
 * Principio KISS: API simple para obtener iconos
 */
class IconLibrary {
    static icons = {
        // Iconos de acción
        close: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>`,
        
        save: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
               </svg>`,

        edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
               </svg>`,

        // Iconos de filtros
        square: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75z" />
                 </svg>`,
        
        grayscale: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v18m0-18a9 9 0 019 9 9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9z" />
                    </svg>`,
        
        resolution: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                     </svg>`,
        
        brightness: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>`,
        
        contrast: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12" />
                   </svg>`,

        sepia: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H9.75a1.75 1.75 0 01-1.75-1.75V7a1.75 1.75 0 011.75-1.75H12m0 13.5v2.25A2.25 2.25 0 019.75 23h-7.5A2.25 2.25 0 010 20.75v-17.5A2.25 2.25 0 012.25 1h7.5A2.25 2.25 0 0112 3.25V6" />
                </svg>`,

        vintage: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                     <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>`,

        // Iconos de estado
        loading: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>`,

        success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>`,

        error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>`
    };

    /**
     * Obtener icono como string SVG
     * @param {string} iconName - Nombre del icono
     * @param {number} size - Tamaño del icono (default: 24)
     * @param {string} className - Clases CSS adicionales
     * @returns {string} - SVG del icono
     */
    static getIcon(iconName, size = 24, className = '') {
        const iconSvg = this.icons[iconName];
        if (!iconSvg) {
            console.warn(`Icono "${iconName}" no encontrado en IconLibrary`);
            return '';
        }

        return iconSvg.replace(
            '<svg',
            `<svg width="${size}" height="${size}" class="${className}"`
        );
    }

    /**
     * Crear elemento DOM con icono
     * @param {string} iconName - Nombre del icono
     * @param {number} size - Tamaño del icono (default: 24)
     * @param {string} className - Clases CSS adicionales
     * @returns {SVGElement|null} - Elemento SVG o null si no se encuentra
     */
    static createIconElement(iconName, size = 24, className = '') {
        const iconSvg = this.getIcon(iconName, size, className);
        if (!iconSvg) {
            return null;
        }

        const div = document.createElement('div');
        div.innerHTML = iconSvg;
        return div.firstElementChild;
    }

    /**
     * Verificar si un icono existe
     * @param {string} iconName - Nombre del icono
     * @returns {boolean} - true si el icono existe
     */
    static hasIcon(iconName) {
        return iconName in this.icons;
    }

    /**
     * Obtener lista de todos los iconos disponibles
     * @returns {string[]} - Array con nombres de iconos
     */
    static getAvailableIcons() {
        return Object.keys(this.icons);
    }

    /**
     * Agregar nuevo icono al sistema
     * @param {string} name - Nombre del icono
     * @param {string} svg - SVG del icono
     */
    static addIcon(name, svg) {
        if (typeof name !== 'string' || typeof svg !== 'string') {
            throw new Error('Nombre e icono deben ser strings');
        }
        
        this.icons[name] = svg;
    }

    /**
     * Remover icono del sistema
     * @param {string} name - Nombre del icono a remover
     * @returns {boolean} - true si se removió exitosamente
     */
    static removeIcon(name) {
        if (name in this.icons) {
            delete this.icons[name];
            return true;
        }
        return false;
    }
}

export { IconLibrary };

