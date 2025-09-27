/**
 * Clase Base Abstracta para Filtros
 * Principio SOLID: Single Responsibility + Open/Closed Principle
 * Principio DRY: Evita duplicación de código común
 * Principio KISS: Interfaz simple y clara
 */
class BaseFilter {
    constructor(name, icon, description) {
        if (this.constructor === BaseFilter) {
            throw new Error('BaseFilter es una clase abstracta y no puede ser instanciada directamente');
        }
        
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.enabled = false;
        this.value = this.getDefaultValue();
    }

    /**
     * Método abstracto que debe ser implementado por cada filtro
     * @param {HTMLCanvasElement} canvas - Canvas donde aplicar el filtro
     * @param {CanvasRenderingContext2D} context - Contexto del canvas
     * @param {ImageData} imageData - Datos de imagen a procesar
     * @returns {ImageData} - Datos de imagen procesados
     */
    apply(canvas, context, imageData) {
        throw new Error(`El método apply() debe ser implementado por la subclase ${this.constructor.name}`);
    }

    /**
     * Valor por defecto del filtro
     * @returns {*} - Valor por defecto
     */
    getDefaultValue() {
        return 1;
    }

    /**
     * Validación de parámetros del filtro
     * @param {*} value - Valor a validar
     * @returns {boolean} - true si el valor es válido
     */
    validate(value) {
        return typeof value === 'number' && value >= 0;
    }

    /**
     * Configurar opciones del filtro
     * @param {Object} options - Opciones de configuración
     * @returns {BaseFilter} - Instancia del filtro para chaining
     */
    configure(options = {}) {
        Object.assign(this, options);
        return this;
    }

    /**
     * Alternar estado habilitado/deshabilitado
     * @returns {boolean} - Nuevo estado del filtro
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Habilitar filtro
     * @returns {BaseFilter} - Instancia del filtro para chaining
     */
    enable() {
        this.enabled = true;
        return this;
    }

    /**
     * Deshabilitar filtro
     * @returns {BaseFilter} - Instancia del filtro para chaining
     */
    disable() {
        this.enabled = false;
        return this;
    }

    /**
     * Establecer valor del filtro
     * @param {*} value - Nuevo valor
     * @returns {BaseFilter} - Instancia del filtro para chaining
     */
    setValue(value) {
        if (this.validate(value)) {
            this.value = value;
        } else {
            console.warn(`Valor inválido para filtro ${this.name}:`, value);
        }
        return this;
    }

    /**
     * Serialización para guardar configuración
     * @returns {Object} - Configuración serializada
     */
    serialize() {
        return {
            name: this.name,
            enabled: this.enabled,
            value: this.value,
            description: this.description
        };
    }

    /**
     * Deserialización para cargar configuración
     * @param {Object} data - Datos serializados
     * @returns {BaseFilter} - Instancia del filtro
     */
    static deserialize(data) {
        const filter = new this();
        filter.enabled = data.enabled || false;
        filter.value = data.value || filter.getDefaultValue();
        return filter;
    }

    /**
     * Obtener información del filtro
     * @returns {Object} - Información del filtro
     */
    getInfo() {
        return {
            name: this.name,
            icon: this.icon,
            description: this.description,
            enabled: this.enabled,
            value: this.value,
            type: this.constructor.name
        };
    }

    /**
     * Verificar si el filtro está activo
     * @returns {boolean} - true si está habilitado
     */
    isActive() {
        return this.enabled;
    }

    /**
     * Resetear filtro a valores por defecto
     * @returns {BaseFilter} - Instancia del filtro para chaining
     */
    reset() {
        this.enabled = false;
        this.value = this.getDefaultValue();
        return this;
    }
}

export { BaseFilter };

