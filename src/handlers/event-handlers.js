import utils from '../utils/utils.js';
import performanceMetrics from '../core/metrics.js';
import lazyLoader from '../core/lazy-loader.js';
import memoryManager from '../core/memory-manager.js';
import canvasPool from '../core/canvas-pool.js';
import FORMAT_CONFIGS from '../config/format-configs.js';

// NOTA: Las referencias a estado global (currentFiles, isConverting, currentFormatConfig, etc.)
// se deben adaptar para futura integración con state.js

const eventHandlers = {
  // Manejar selección de archivo
  async handleFileSelect(event, state, elements) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      await this.processFiles(files, state, elements);
    }
  },

  // Manejar arrastre de archivo
  async handleDrop(event, state, elements) {
    event.preventDefault();
    elements.dropZone.classList.remove('border-blue-400', 'bg-blue-50');
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      await this.processFiles(files, state, elements);
    }
  },

  // Manejar drag over
  handleDragOver(event, elements) {
    event.preventDefault();
    elements.dropZone.classList.add('border-blue-400', 'bg-blue-50');
  },

  // Manejar drag leave
  handleDragLeave(event, elements) {
    event.preventDefault();
    elements.dropZone.classList.remove('border-blue-400', 'bg-blue-50');
  },

  // Procesar archivos seleccionados
  async processFiles(files, state, elements) {
    try {
      if (!Array.isArray(files) || files.length === 0) {
        utils.showError('No se proporcionaron archivos válidos', elements);
        return;
      }
      if (files.length > state.CONFIG.MAX_FILES) {
        utils.showError(`Máximo ${state.CONFIG.MAX_FILES} archivos permitidos`, elements);
        return;
      }
      const validFiles = [];
      const invalidFiles = [];
      const validationPromises = files.map(async (file) => {
        try {
          if (!file || !(file instanceof File)) {
            return { valid: false, error: 'Archivo inválido' };
          }
          if (!utils.isValidFileName(file.name)) {
            return { valid: false, error: `Nombre inválido: ${file.name}` };
          }
          const isValidType = await utils.isValidImageType(file);
          if (!isValidType) {
            return { valid: false, error: `Tipo no soportado: ${file.name}` };
          }
          if (!utils.isValidFileSize(file)) {
            return { valid: false, error: `Tamaño excede límite: ${file.name}` };
          }
          if (file.size === 0) {
            return { valid: false, error: `Archivo vacío: ${file.name}` };
          }
          performanceMetrics.addFile(file);
          return { valid: true, file };
        } catch (error) {
          console.error('Error procesando archivo:', error);
          return { valid: false, error: `Error en archivo: ${file.name}` };
        }
      });
      const results = await Promise.all(validationPromises);
      results.forEach(result => {
        if (result.valid) {
          validFiles.push(result.file);
        } else {
          invalidFiles.push(result.error);
        }
      });
      if (invalidFiles.length > 0) {
        utils.showError(`Archivos inválidos: ${invalidFiles.slice(0, 3).join(', ')}${invalidFiles.length > 3 ? '...' : ''}`, elements);
      }
      if (validFiles.length > 0) {
        state.currentFiles = validFiles;
        utils.hideError(elements);
        this.updateFileList(state, elements);
      }
    } catch (error) {
      console.error('Error en processFiles:', error);
      utils.showError('Error procesando archivos', elements);
    }
  },

  // Actualizar lista de archivos
  updateFileList(state, elements) {
    if (!elements.fileList || !elements.fileListContainer) return;
    elements.fileList.innerHTML = '';
    if (state.currentFiles.length === 0) {
      elements.fileListContainer.classList.add('hidden');
      return;
    }
    elements.fileListContainer.classList.remove('hidden');
    state.currentFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-list-item';
      // Contenedor izquierdo con vista previa y información
      const leftContainer = document.createElement('div');
      leftContainer.className = 'flex items-center flex-1';
      // Vista previa en miniatura
      const previewContainer = document.createElement('div');
      previewContainer.className = 'file-preview-thumbnail';
      const previewImg = document.createElement('img');
      previewImg.className = 'w-full h-full object-cover';
      previewImg.alt = `Vista previa de ${file.name}`;
      // Crear URL para la vista previa usando el memory manager
      const previewUrl = memoryManager.createObjectURL(file);
      file.previewUrl = previewUrl; // Almacenar URL para limpieza posterior
      previewImg.src = previewUrl;
      previewContainer.appendChild(previewImg);
      // Información del archivo
      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info';
      const truncatedName = utils.truncateFileName(file.name, 25);
      const sanitizedFileName = utils.sanitizeText(file.name);
      const sanitizedTruncatedName = utils.sanitizeText(truncatedName);
      const sanitizedFileSize = utils.sanitizeText(utils.formatFileSize(file.size));
      fileInfo.innerHTML = `
        <div class="file-name" title="${sanitizedFileName}">${sanitizedTruncatedName}</div>
        <div class="file-size">${sanitizedFileSize}</div>
      `;
      leftContainer.appendChild(previewContainer);
      leftContainer.appendChild(fileInfo);
      // Contenedor de botones
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'flex items-center space-x-2';
      // Botón de editar
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-file-btn';
      editBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      `;
      editBtn.title = 'Editar imagen';
      editBtn.onclick = () => {
        if (this.openImageEditor) this.openImageEditor(index, state, elements);
      };
      // Botón de eliminar
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-file-btn';
      removeBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
      removeBtn.onclick = () => {
        this.removeFile(index, state, elements);
      };
      buttonsContainer.appendChild(editBtn);
      buttonsContainer.appendChild(removeBtn);
      fileItem.appendChild(leftContainer);
      fileItem.appendChild(buttonsContainer);
      elements.fileList.appendChild(fileItem);
    });
  },

  // Remover archivo con gestión de memoria mejorada
  removeFile(index, state, elements) {
    const file = state.currentFiles[index];
    if (file && file.previewUrl) {
      memoryManager.revokeObjectURL(file.previewUrl);
    }
    state.currentFiles.splice(index, 1);
    this.updateFileList(state, elements);
    this.updateFileInfo(state, elements);
  },

  // Actualizar información del archivo (placeholder)
  updateFileInfo(state, elements) {
    // Información ya mostrada en la lista
  },

  // Remover todas las imágenes con limpieza de memoria
  removeAllImages(state, elements) {
    state.currentFiles.forEach(file => {
      if (file.previewUrl) {
        memoryManager.revokeObjectURL(file.previewUrl);
      }
    });
    state.currentFiles = [];
    elements.fileInput.value = '';
    elements.fileListContainer.classList.add('hidden');
    this.updateFileList(state, elements);
    utils.hideError(elements);
  },

  // Actualizar opciones de formato
  updateFormatOptions(state, elements) {
    const selectedFormat = elements.formatSelect.value;
    state.currentFormatConfig = FORMAT_CONFIGS[selectedFormat];
    if (!state.currentFormatConfig) return;
    elements.formatOptions.innerHTML = '';
    Object.entries(state.currentFormatConfig.options).forEach(([key, option]) => {
      const optionElement = utils.createOptionElement(state.currentFormatConfig, key, option);
      elements.formatOptions.appendChild(optionElement);
    });
  },

  // Obtener opciones de formato
  getFormatOptions(elements) {
    const options = {};
    elements.formatOptions.querySelectorAll('input, select').forEach(element => {
      if (element.type === 'checkbox') {
        if (!(element.name in options)) {
          options[element.name] = [];
        }
        if (element.checked) {
          options[element.name].push(element.value);
        }
      } else if (element.type === 'range') {
        options[element.name] = parseInt(element.value);
      } else if (element.tagName === 'SELECT') {
        if (element.multiple) {
          options[element.name] = Array.from(element.selectedOptions).map(opt => opt.value);
        } else {
          options[element.name] = element.value;
        }
      }
    });
    return options;
  },

  // Convertir imagen
  async convertImage(state, elements) {
    try {
      performanceMetrics.startConversion();
      performanceMetrics.updateMemoryUsage();
      if (state.currentFiles.length === 0) {
        utils.showError('No hay archivos seleccionados', elements);
        performanceMetrics.endConversion(false);
        return;
      }
      if (state.isConverting.value) {
        utils.showError('Conversión en progreso', elements);
        performanceMetrics.endConversion(false);
        return;
      }
      if (!state.currentFormatConfig) {
        utils.showError('Formato no configurado', elements);
        performanceMetrics.endConversion(false);
        return;
      }
      if (!utils.checkRateLimit(state.lastConversionTime)) {
        utils.showError('Espere un momento antes de realizar otra conversión', elements);
        performanceMetrics.endConversion(false);
        return;
      }
      const targetFormat = elements.formatSelect.value;
      const formatOptions = this.getFormatOptions(elements);
      const validationErrors = utils.validateInputParams(formatOptions);
      if (validationErrors.length > 0) {
        utils.showError(`Parámetros inválidos: ${validationErrors.join(', ')}`, elements);
        return;
      }
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de seguridad')), state.CONFIG.SECURITY_TIMEOUT);
      });
      utils.showLoading(elements, state.isConverting);
      utils.hideError(elements);
      utils.generateSecurityToken(state.securityToken);
      try {
        const conversionPromise = this.performConversion(targetFormat, formatOptions, state, elements);
        await Promise.race([conversionPromise, timeoutPromise]);
      } catch (error) {
        if (error.message === 'Timeout de seguridad') {
          utils.showError('Operación cancelada por seguridad', elements);
        } else {
          console.error('Error durante la conversión:', error);
          utils.showError('Error durante la conversión', elements);
        }
        performanceMetrics.endConversion(false);
      } finally {
        utils.hideLoading(elements, state.isConverting);
        performanceMetrics.updateMemoryUsage();
      }
    } catch (error) {
      console.error('Error en convertImage:', error);
      utils.showError('Error interno del sistema', elements);
      performanceMetrics.endConversion(false);
      utils.hideLoading(elements, state.isConverting);
    }
  },

  async performConversion(targetFormat, formatOptions, state, elements) {
    if (targetFormat === 'image/ico' && formatOptions.sizes) {
      await this.convertToIcoMultiple(formatOptions.sizes, state, elements);
      return;
    }
    if (state.workerManager && state.workerManager.isWorkerAvailable()) {
      await this.performConversionWithWorker(targetFormat, formatOptions, state, elements);
    } else {
      await this.performConversionSync(targetFormat, formatOptions, state, elements);
    }
  },

  async performConversionWithWorker(targetFormat, formatOptions, state, elements) {
    try {
      if (!state.workerManager) {
        const WorkerManagerClass = await lazyLoader.loadWorkerManager();
        if (WorkerManagerClass.isSupported()) {
          state.workerManager = new WorkerManagerClass();
        } else {
          throw new Error('Web Workers no soportados');
        }
      }
      const formatConfig = FORMAT_CONFIGS[targetFormat];
      const defaultQuality = formatConfig.quality.default / 100;
      const options = {
        maxSizeMB: state.CONFIG.MAX_SIZE_MB,
        maxWidthOrHeight: state.CONFIG.MAX_WIDTH_HEIGHT,
        fileType: targetFormat,
        quality: defaultQuality,
        ...formatOptions
      };
      const results = await state.workerManager.processMultipleFiles(
        state.currentFiles,
        options,
        (progress) => {
          console.log(`Progreso: ${Math.round(progress.progress)}% - Archivo ${progress.index + 1}`);
        }
      );
      const convertedFiles = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.success) {
          const file = state.currentFiles[i];
          const originalName = file.name.split('.')[0];
          const extension = utils.getFormatExtension(targetFormat);
          const fileName = utils.sanitizeFileName(`${originalName}_converted.${extension}`);
          convertedFiles.push({ file: result.file, fileName });
        } else {
          console.error(`Error convirtiendo archivo ${i + 1}:`, result.error);
          throw new Error(`Error convirtiendo archivo ${i + 1}: ${result.error}`);
        }
      }
      if (convertedFiles.length === 1) {
        utils.downloadFile(convertedFiles[0].file, convertedFiles[0].fileName);
        this.showSuccessMessage(state, convertedFiles[0].file.size, elements);
      } else {
        const zipBlob = await utils.createZipFile(convertedFiles);
        const zipFileName = `imagenes_convertidas_${new Date().toISOString().slice(0, 10)}.zip`;
        utils.downloadFile(zipBlob, zipFileName);
        this.showSuccessMessage(state, 0, elements, `Convertidos ${convertedFiles.length} archivos en ZIP`);
      }
    } catch (error) {
      console.error('Error en conversión con Web Worker:', error);
      await this.performConversionSync(targetFormat, formatOptions, state, elements);
    }
  },

  async performConversionSync(targetFormat, formatOptions, state, elements) {
    const imageCompression = await lazyLoader.loadImageCompression();
    const convertedFiles = [];
    for (let i = 0; i < state.currentFiles.length; i++) {
      try {
        const file = state.currentFiles[i];
        const formatConfig = FORMAT_CONFIGS[targetFormat];
        const defaultQuality = formatConfig.quality.default / 100;
        const options = {
          maxSizeMB: state.CONFIG.MAX_SIZE_MB,
          maxWidthOrHeight: state.CONFIG.MAX_WIDTH_HEIGHT,
          useWebWorker: false,
          fileType: targetFormat,
          quality: defaultQuality,
          ...formatOptions,
          onProgress: (progress) => {
            console.log(`Progreso archivo ${i + 1}: ${Math.round(progress)}%`);
          }
        };
        const compressedFile = await imageCompression(file, options);
        const originalName = file.name.split('.')[0];
        const extension = utils.getFormatExtension(targetFormat);
        const fileName = utils.sanitizeFileName(`${originalName}_converted.${extension}`);
        convertedFiles.push({ file: compressedFile, fileName });
      } catch (error) {
        console.error(`Error convirtiendo archivo ${i + 1}:`, error);
        throw new Error(`Error convirtiendo archivo ${i + 1}`);
      }
    }
    if (convertedFiles.length === 1) {
      utils.downloadFile(convertedFiles[0].file, convertedFiles[0].fileName);
      this.showSuccessMessage(state, convertedFiles[0].file.size, elements);
    } else {
      const zipBlob = await utils.createZipFile(convertedFiles);
      const zipFileName = `imagenes_convertidas_${new Date().toISOString().slice(0, 10)}.zip`;
      utils.downloadFile(zipBlob, zipFileName);
      this.showSuccessMessage(state, 0, elements, `Convertidos ${convertedFiles.length} archivos en ZIP`);
    }
  },

  // Conversión especial para ICO múltiple
  async convertToIcoMultiple(sizes, state, elements) {
    const convertedFiles = [];
    const errors = [];
    const icoConfig = FORMAT_CONFIGS['image/ico'];
    const allSizes = [...(icoConfig.hiddenSizes || []), ...sizes];
    for (let i = 0; i < state.currentFiles.length; i++) {
      const file = state.currentFiles[i];
      const originalName = file.name.split('.')[0];
      for (const size of allSizes) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              try {
                canvas.width = size;
                canvas.height = size;
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, size, size);
                resolve();
              } catch (error) {
                reject(error);
              }
            };
            img.onerror = () => reject(new Error('Error al cargar imagen'));
            img.src = URL.createObjectURL(file);
          });
          const blob = await new Promise((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(null);
              }
            }, 'image/png', 1.0);
          });
          if (!blob) {
            throw new Error(`No se pudo crear blob para ${size}x${size}`);
          }
          if (!icoConfig.hiddenSizes.includes(size)) {
            const fileName = utils.sanitizeFileName(`${originalName}_${size}x${size}.ico`);
            convertedFiles.push({ file: blob, fileName });
          }
        } catch (error) {
          const errorMsg = `Error convirtiendo ${file.name} a ${size}x${size}: ${error.message}`;
          errors.push(errorMsg);
        }
      }
    }
    if (errors.length > 0) {
      console.warn('Errores durante la conversión:', errors);
    }
    if (convertedFiles.length === 0) {
      utils.showError('No se pudo generar ningún icono. Verifica que las imágenes sean válidas.', elements);
      return;
    } else if (convertedFiles.length === 1) {
      utils.downloadFile(convertedFiles[0].file, convertedFiles[0].fileName);
      this.showSuccessMessage(state, 0, elements, 'Icono convertido exitosamente');
    } else {
      const zipBlob = await utils.createZipFile(convertedFiles);
      const zipFileName = `iconos_${new Date().toISOString().slice(0, 10)}.zip`;
      utils.downloadFile(zipBlob, zipFileName);
      this.showSuccessMessage(state, 0, elements, `Generados ${convertedFiles.length} iconos en ZIP`);
    }
  },

  // Mostrar mensaje de éxito
  showSuccessMessage(state, compressedSize, elements, customMessage = null) {
    let message = customMessage;
    if (!message) {
      const totalOriginalSize = state.currentFiles.reduce((sum, file) => sum + file.size, 0);
      const reduction = totalOriginalSize > 0 ? ((totalOriginalSize - compressedSize) / totalOriginalSize * 100).toFixed(1) : 0;
      message = `Conversión exitosa - Reducción: ${reduction}%`;
    }
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 notification-enter';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('notification-exit');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },

  // Editor de imagen con TOAST UI
  async openImageEditor(fileIndex, state, elements) {
    const file = state.currentFiles[fileIndex];
    if (!file) return;
    if (typeof tui === 'undefined' || typeof tui.ImageEditor === 'undefined') {
      console.error('TOAST UI Image Editor no está disponible');
      utils.showError('Editor de imagen no disponible. Por favor, recarga la página.', elements);
      return;
    }
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    modal.id = 'imageEditorModal';
    const imageUrl = memoryManager.createObjectURL(file);
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Editor de Imagen</h3>
          <div class="flex items-center space-x-2">
            <button id="saveAndCloseBtn" class="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Guardar cambios y cerrar editor">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
            </button>
            <button id="closeEditor" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="relative flex-1" style="height: calc(95vh - 80px);">
          <div id="tui-image-editor-container" class="w-full h-full bg-gray-50 dark:bg-gray-900"></div>
        </div>
      </div>
    `;
    console.log('### MODAL ABOUT TO BE APPENDED');
    document.body.appendChild(modal);
    console.log('### MODAL APPENDED');
    await this.initToastImageEditor(fileIndex, imageUrl, state, elements);
  },

  async initToastImageEditor(fileIndex, imageUrl, state, elements) {
    const ToastImageEditor = await lazyLoader.loadToastImageEditor();
    const container = document.getElementById('tui-image-editor-container');
    if (!container) {
      console.error('Contenedor del editor no encontrado');
      return;
    }
    const isDarkMode = document.documentElement.classList.contains('dark');
    const options = {
      includeUI: {
        loadImage: {
          path: imageUrl,
          name: 'image'
        },
        locale: {
          'Crop': 'Recortar',
          'Delete-all': 'Eliminar todo',
          'Flip': 'Voltear',
          'Rotate': 'Rotar',
          'Draw': 'Dibujar',
          'Shape': 'Forma',
          'Icon': 'Icono',
          'Text': 'Texto',
          'Mask': 'Máscara',
          'Filter': 'Filtro',
          'Zoom': 'Zoom',
          'Undo': 'Deshacer',
          'Redo': 'Rehacer',
          'Reset': 'Restablecer',
          'Save': 'Guardar',
          'Cancel': 'Cancelar'
        },
        initMenu: 'filter',
        menuBarPosition: 'bottom'
      },
      cssMaxWidth: 700,
      cssMaxHeight: 500,
      selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
      },
      usageStatistics: false
    };
    try {
      const imageEditor = new ToastImageEditor(container, options);
      this.editorState = {
        editor: imageEditor,
        fileIndex,
        imageUrl
      };
      this.setupToastEventListeners(state, elements);
    } catch (error) {
      console.error('Error al inicializar TOAST UI Image Editor:', error);
      utils.showError('Error al cargar el editor de imagen', elements);
    }
  },

  setupToastEventListeners(state, elements) {
    document.getElementById('closeEditor').onclick = () => this.closeImageEditor(state, elements);
    document.getElementById('saveAndCloseBtn').onclick = () => this.applyImageChanges(state, elements);
    if (this.editorState && this.editorState.editor) {
      const editor = this.editorState.editor;
      editor.on('load', () => {
        console.log('Imagen cargada correctamente en el editor');
      });
      editor.on('objectActivated', (props) => {
        console.log('Objeto activado:', props);
      });
      editor.on('objectMoved', (props) => {
        console.log('Objeto movido:', props);
      });
    }
  },

  closeImageEditor(state, elements) {
    const modal = document.getElementById('imageEditorModal');
    if (modal) {
      if (this.editorState && this.editorState.editor) {
        this.editorState.editor.destroy();
      }
      document.body.removeChild(modal);
    }
    if (this.editorState && this.editorState.imageUrl) {
      memoryManager.revokeObjectURL(this.editorState.imageUrl);
    }
    this.editorState = null;
  },

  applyImageChanges(state, elements) {
    if (!this.editorState || !this.editorState.editor) {
      console.error('Editor no disponible');
      return;
    }
    const { editor, fileIndex } = this.editorState;
    const file = state.currentFiles[fileIndex];
    try {
      const dataURL = editor.toDataURL({ format: 'png', quality: 0.9 });
      this.dataURLToBlob(dataURL)
        .then(blob => {
          const newFile = new File([blob], file.name, { type: file.type });
          state.currentFiles[fileIndex] = newFile;
          if (file.previewUrl) {
            memoryManager.revokeObjectURL(file.previewUrl);
          }
          this.closeImageEditor(state, elements);
          this.updateFileList(state, elements);
          this.showSuccessMessage(state, 0, elements, 'Imagen editada exitosamente');
        })
        .catch(error => {
          console.error('Error al procesar imagen:', error);
          utils.showError('Error al procesar la imagen editada', elements);
        });
    } catch (error) {
      console.error('Error al aplicar cambios de imagen:', error);
      utils.showError('Error al procesar la imagen editada', elements);
    }
  },

  dataURLToBlob(dataURL) {
    return new Promise((resolve, reject) => {
      try {
        const base64 = dataURL.split(',')[1];
        if (!base64) {
          reject(new Error('Data URL inválida'));
          return;
        }
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  },

  // Utilidad para calcular tamaño de imagen
  calculateImageSize(imgWidth, imgHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    return {
      width: imgWidth * ratio,
      height: imgHeight * ratio
    };
  }
};

export default eventHandlers;