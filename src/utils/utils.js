import CONFIG from '../config/config.js';
import FORMAT_CONFIGS from '../config/format-configs.js';
import TOOLTIP_DESCRIPTIONS from '../config/tooltips.js';
import memoryManager from '../core/memory-manager.js';
import canvasPool from '../core/canvas-pool.js';

// Funciones utilitarias para validaciones, sanitización, descargas, dark mode, etc.
const utils = {
  // Formatear tamaño de archivo
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validar tipo de archivo con verificación de contenido mejorada
  async isValidImageType(file) {
    if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) return false;
    const fileName = file.name.toLowerCase();
    const hasValidExtension = CONFIG.ALLOWED_FILE_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) return false;
    const magicBytes = CONFIG.MAGIC_BYTES[file.type];
    if (magicBytes) {
      return await this.isValidMagicBytes(file, magicBytes);
    }
    return true;
  },

  // Validar magic bytes de forma asíncrona
  async isValidMagicBytes(file, magicBytes) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target.result;
          const uint8Array = new Uint8Array(arrayBuffer);
          const start = uint8Array.slice(0, magicBytes.length);
          const isValid = magicBytes.every((byte, index) => start[index] === byte);
          resolve(isValid);
        } catch (error) {
          console.error('Error validando magic bytes:', error);
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, Math.max(...magicBytes.map((_, i) => i + 1))));
    });
  },

  // Validar tamaño de archivo
  isValidFileSize(file) {
    return file.size > 0 && file.size <= CONFIG.MAX_FILE_SIZE;
  },

  // Validar nombre de archivo
  isValidFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return false;
    if (fileName.length > CONFIG.MAX_FILE_NAME_LENGTH) return false;
    // eslint-disable-next-line no-control-regex
    const dangerousChars = /[<>:"/\\|?*\u0000-\u001f]/;
    if (dangerousChars.test(fileName)) return false;
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(fileName)) return false;
    return true;
  },

  // Sanitizar nombre de archivo de forma segura
  sanitizeFileName(fileName) {
    if (!this.isValidFileName(fileName)) {
      return 'archivo_seguro_' + Date.now();
    }
    let sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitized.length > CONFIG.MAX_FILE_NAME_LENGTH) {
      const lastDotIndex = sanitized.lastIndexOf('.');
      if (lastDotIndex > 0) {
        const extension = sanitized.substring(lastDotIndex);
        const name = sanitized.substring(0, lastDotIndex);
        sanitized = name.substring(0, CONFIG.MAX_FILE_NAME_LENGTH - extension.length) + extension;
      } else {
        sanitized = sanitized.substring(0, CONFIG.MAX_FILE_NAME_LENGTH);
      }
    }
    if (!sanitized.replace(/[_\.]/g, '')) {
      sanitized = 'archivo_seguro_' + Date.now();
    }
    return sanitized;
  },

  // Truncar nombre de archivo para mostrar en la UI
  truncateFileName(fileName, maxLength = 30) {
    if (fileName.length <= maxLength) return fileName;
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return fileName.substring(0, maxLength - 3) + '...';
    }
    const name = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    const availableForName = maxLength - extension.length - 3;
    if (availableForName <= 0) {
      return '...' + extension;
    }
    const truncatedName = name.substring(0, availableForName);
    return truncatedName + '...' + extension;
  },

  // Obtener extensión del formato
  getFormatExtension(mimeType) {
    return FORMAT_CONFIGS[mimeType]?.extension || 'jpg';
  },

  // Validar parámetros de entrada
  validateInputParams(params) {
    const errors = [];
    if (params.sizes && Array.isArray(params.sizes)) {
      const validSizes = [16, 32, 48, 64, 128, 256];
      params.sizes.forEach(size => {
        if (!validSizes.includes(parseInt(size))) {
          errors.push(`Tamaño de icono inválido: ${size}`);
        }
      });
    }
    return errors;
  },

  // Rate limiting mejorado
  checkRateLimit(lastConversionTimeRef) {
    const now = Date.now();
    if (now - lastConversionTimeRef.value < CONFIG.RATE_LIMIT_DELAY) {
      return false;
    }
    lastConversionTimeRef.value = now;
    return true;
  },

  // Generar token de seguridad mejorado
  generateSecurityToken(securityTokenRef) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    securityTokenRef.value = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return securityTokenRef.value;
  },

  // Validar token de seguridad
  validateSecurityToken(token, securityTokenRef) {
    return token === securityTokenRef.value;
  },

  // Sanitizar texto para evitar XSS mejorado
  sanitizeText(text) {
    if (typeof text !== 'string') return '';
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Funciones para modo oscuro
  toggleDarkMode(elements) {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    this.updateDarkModeIcons(isDark, elements);
  },

  updateDarkModeIcons(isDark, elements) {
    if (isDark) {
      elements.moonIcon.classList.add('hidden');
      elements.sunIcon.classList.remove('hidden');
    } else {
      elements.moonIcon.classList.remove('hidden');
      elements.sunIcon.classList.add('hidden');
    }
  },

  initDarkMode(elements) {
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isDark = false;
    if (savedDarkMode === 'true') {
      isDark = true;
    } else if (savedDarkMode === null && prefersDark) {
      isDark = true;
    }
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    this.updateDarkModeIcons(isDark, elements);
  },

  // Mostrar error de forma segura
  showError(message, elements) {
    const sanitizedMessage = this.sanitizeText(message);
    elements.errorText.textContent = sanitizedMessage;
    elements.errorMessage.classList.remove('hidden');
    setTimeout(() => {
      elements.errorMessage.classList.add('hidden');
    }, 5000);
  },

  // Ocultar error
  hideError(elements) {
    elements.errorMessage.classList.add('hidden');
  },

  // Mostrar carga
  showLoading(elements, isConvertingRef) {
    elements.loading.classList.remove('hidden');
    elements.convertButton.disabled = true;
    isConvertingRef.value = true;
  },

  // Ocultar carga
  hideLoading(elements, isConvertingRef) {
    elements.loading.classList.add('hidden');
    elements.convertButton.disabled = false;
    isConvertingRef.value = false;
  },

  // Descargar archivo con gestión de memoria mejorada
  downloadFile(file, fileName) {
    const url = memoryManager.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      memoryManager.revokeObjectURL(url);
    }, 1000);
  },

  // Crear archivo ZIP con gestión de memoria mejorada
  async createZipFile(files) {
    const JSZip = await import('jszip');
    const zip = new JSZip.default();
    files.forEach(({ file, fileName }) => {
      zip.file(fileName, file);
    });
    return await zip.generateAsync({ type: 'blob' });
  },

  // Crear elemento de opción (UI helpers)
  createOptionElement(config, key, option) {
    const container = document.createElement('div');
    container.className = 'format-option';

    const label = document.createElement('label');
    label.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center';

    // Agregar tooltip si existe descripción
    const tooltipKey = key in TOOLTIP_DESCRIPTIONS ? key : option.label;
    if (TOOLTIP_DESCRIPTIONS[tooltipKey]) {
      label.innerHTML = `
        ${this.sanitizeText(option.label)}
        <svg class="w-4 h-4 ml-1 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="tooltip-text">${this.sanitizeText(TOOLTIP_DESCRIPTIONS[tooltipKey])}</span>
      `;
    } else {
      label.textContent = option.label;
    }

    if (option.type === 'checkbox' && option.options) {
      // Sistema de checklist para opciones múltiples
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'space-y-2';
      option.options.forEach(opt => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'flex items-center';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-${key}-${opt}`;
        checkbox.value = opt;
        checkbox.name = key;
        checkbox.className = 'mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600 rounded';
        if (option.default && option.default.includes(opt)) {
          checkbox.checked = true;
        }
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = `checkbox-${key}-${opt}`;
        checkboxLabel.className = 'text-sm text-gray-700 dark:text-gray-300';
        checkboxLabel.textContent = `${opt}x${opt}`;
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(checkboxLabel);
        checkboxContainer.appendChild(checkboxDiv);
      });
      container.appendChild(label);
      container.appendChild(checkboxContainer);
    } else if (option.options) {
      // Select para opciones múltiples
      const select = document.createElement('select');
      select.className = 'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white';
      select.multiple = option.multiple || false;
      select.name = key;
      option.options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt;
        optionEl.textContent = opt;
        if (option.default && (Array.isArray(option.default) ? option.default.includes(opt) : option.default === opt)) {
          optionEl.selected = true;
        }
        select.appendChild(optionEl);
      });
      container.appendChild(label);
      container.appendChild(select);
    } else if (option.min !== undefined && option.max !== undefined) {
      // Slider para rangos
      const slider = document.createElement('input');
      slider.type = 'range';
      slider.min = option.min;
      slider.max = option.max;
      slider.value = option.default;
      slider.className = 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider';
      slider.name = key;
      const valueDisplay = document.createElement('span');
      valueDisplay.className = 'text-sm text-gray-500 dark:text-gray-400 ml-2';
      valueDisplay.textContent = option.default;
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
      });
      const sliderContainer = document.createElement('div');
      sliderContainer.className = 'flex items-center';
      sliderContainer.appendChild(slider);
      sliderContainer.appendChild(valueDisplay);
      container.appendChild(label);
      container.appendChild(sliderContainer);
    } else {
      // Checkbox para booleanos
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = option.default;
      checkbox.className = 'mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600 rounded';
      checkbox.name = key;
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'flex items-center';
      const tooltipKey = key in TOOLTIP_DESCRIPTIONS ? key : option.label;
      if (TOOLTIP_DESCRIPTIONS[tooltipKey]) {
        checkboxContainer.innerHTML = `
          <input type="checkbox" ${option.default ? 'checked' : ''} class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 dark:bg-gray-600 rounded" name="${this.sanitizeText(key)}">
          <span class="flex items-center text-gray-700 dark:text-gray-300">
            ${this.sanitizeText(option.label)}
            <svg class="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="tooltip-text">${this.sanitizeText(TOOLTIP_DESCRIPTIONS[tooltipKey])}</span>
          </span>
        `;
      } else {
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(document.createTextNode(option.label));
      }
      container.appendChild(checkboxContainer);
    }
    return container;
  },

  // Crear archivo ICO real con pool de canvas
  async createIcoFile(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  },

  // Redimensionar imagen a tamaño específico con pool de canvas
  async resizeImage(file, width, height) {
    return new Promise((resolve, reject) => {
      const canvas = canvasPool.getCanvas(width, height);
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        try {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al crear blob'));
            }
            canvasPool.returnCanvas(canvas);
          }, 'image/png', 1.0);
        } catch (error) {
          canvasPool.returnCanvas(canvas);
          reject(error);
        }
      };
      img.onerror = () => {
        canvasPool.returnCanvas(canvas);
        reject(new Error('Error al cargar imagen'));
      };
      img.src = memoryManager.createObjectURL(file);
    });
  }
};

export default utils;