/**
 * Índice de Filtros
 * Exporta todos los filtros disponibles
 * Principio DRY: Centraliza las exportaciones
 */

// Filtros básicos
export { BaseFilter } from './BaseFilter.js';
export { SquareFilter } from './SquareFilter.js';
export { GrayscaleFilter } from './GrayscaleFilter.js';
export { ResolutionFilter } from './ResolutionFilter.js';

// Filtros avanzados (se implementarán en la siguiente fase)
// export { BrightnessFilter } from './BrightnessFilter.js';
// export { ContrastFilter } from './ContrastFilter.js';
// export { SepiaFilter } from './SepiaFilter.js';
// export { VintageFilter } from './VintageFilter.js';

/**
 * Lista de todos los filtros disponibles
 */
export const AVAILABLE_FILTERS = [
    'SquareFilter',
    'GrayscaleFilter', 
    'ResolutionFilter'
    // 'BrightnessFilter',
    // 'ContrastFilter',
    // 'SepiaFilter',
    // 'VintageFilter'
];

/**
 * Mapa de filtros por nombre
 */
export const FILTER_MAP = {
    square: 'SquareFilter',
    grayscale: 'GrayscaleFilter',
    resolution: 'ResolutionFilter'
    // brightness: 'BrightnessFilter',
    // contrast: 'ContrastFilter',
    // sepia: 'SepiaFilter',
    // vintage: 'VintageFilter'
};

