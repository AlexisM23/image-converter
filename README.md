# Image Converter

Este proyecto es una aplicación web avanzada y minimalista para la conversión y edición de imágenes directamente en el navegador. Su diseño y arquitectura priorizan la experiencia de usuario, la eficiencia y la claridad visual, integrando tecnologías modernas y librerías de alto rendimiento.

## Descripción general

Image Converter permite a los usuarios cargar imágenes, convertirlas entre distintos formatos y editarlas visualmente mediante un editor integrado, todo sin salir del navegador ni instalar software adicional. La interfaz es minimalista, basada en iconos y tooltips, y evita cualquier elemento visual innecesario.

## Características técnicas principales

- **Conversión entre formatos**: Soporta múltiples formatos de imagen (PNG, JPEG, WebP, ICO, entre otros).
- **Edición avanzada**: Integración profunda con [TOAST UI Image Editor](https://ui.toast.com/tui-image-editor), permitiendo recortar, rotar, dibujar, aplicar filtros, añadir texto, formas, iconos y más, todo con una interfaz visual moderna y personalizable.
- **Procesamiento eficiente**: Uso de Web Workers para operaciones pesadas, evitando bloqueos en la interfaz.
- **Carga dinámica de dependencias**: Las librerías pesadas (como TOAST UI, fabric.js o browser-image-compression) se cargan solo cuando son necesarias, optimizando el rendimiento inicial.
- **Interfaz minimalista**: Solo iconos, tooltips y una barra de herramientas compacta superpuesta a la imagen.
- **Soporte para modo oscuro**: Adaptación automática de la interfaz según el tema del sistema o preferencia del usuario.
- **Registros claros**: Los mensajes de estado y logs son concisos, sin emojis ni texto redundante.
- **Procesamiento local**: Ningún archivo se sube a servidores externos; todo ocurre en el navegador.

## Tecnologías y librerías utilizadas

- **HTML5** y **CSS3** (Tailwind CSS para estilos utilitarios y personalizados).
- **JavaScript** moderno (ES6+).
- **Vite** como bundler y servidor de desarrollo.
- **TOAST UI Image Editor** para edición visual avanzada de imágenes.
- **browser-image-compression** para compresión eficiente de imágenes.
- **fabric.js** (a través de TOAST UI) para manipulación de lienzos.
- **Web Workers** para procesamiento paralelo.
- **Arquitectura modular**: Separación clara entre lógica, configuración, utilidades y componentes visuales.

## Detalles de implementación

### Integración de TOAST UI Image Editor

- El editor de imágenes se integra de forma dinámica: solo se carga cuando el usuario lo solicita, gracias a un sistema de lazy loading implementado en `src/core/lazy-loader.js`.
- La función `loadToastImageEditor` verifica si la librería está disponible globalmente (`tui.ImageEditor`). Si no lo está, lanza un error controlado.
- Al abrir el editor, se crea un modal superpuesto con un contenedor específico para TOAST UI (`tui-image-editor-container`), gestionado desde `src/handlers/event-handlers.js`.
- El editor se inicializa con opciones personalizadas:
  - Localización al español de todos los menús y acciones.
  - Menú inferior y maximización del área de edición.
  - Adaptación automática al modo oscuro.
  - Configuración de tamaño máximo, estilos de selección y desactivación de estadísticas de uso.
- Se gestionan eventos del editor (carga de imagen, activación y movimiento de objetos, guardado, cierre, etc.) para ofrecer una experiencia fluida y controlada.
- Al guardar los cambios, la imagen editada se convierte a un blob y reemplaza el archivo original en la lista de archivos del usuario, todo en memoria y sin recargas.

### Procesamiento y conversión

- La compresión y conversión de imágenes se realiza mediante la librería `browser-image-compression`, también cargada dinámicamente.
- Para conversiones complejas o múltiples, se utilizan Web Workers, gestionados por el módulo `worker-manager.js`, evitando bloqueos en la interfaz.
- El sistema de memoria y gestión de blobs garantiza que no haya fugas de memoria ni referencias innecesarias a archivos temporales.

### Interfaz y experiencia de usuario

- La interfaz está construida sobre Tailwind CSS, con estilos personalizados para sliders, listas de archivos, botones y modales.
- Todos los botones son iconográficos, con tooltips explicativos y sin texto visible, siguiendo una filosofía minimalista.
- El modo oscuro se aplica automáticamente y afecta tanto a la interfaz propia como al editor de imágenes.
- Los mensajes de error y éxito se muestran mediante notificaciones visuales discretas, sin emojis ni elementos distractores.

## Estructura del proyecto

```
image-converter/
│
├── index.html                # Entrada principal de la aplicación
├── src/                      # Código fuente principal
│   ├── config/               # Configuraciones y tooltips
│   ├── core/                 # Núcleo: gestión de estado, memoria, métricas, lazy loading, etc.
│   ├── handlers/             # Manejadores de eventos (incluye la lógica del editor de imágenes)
│   ├── utils/                # Utilidades generales
│   ├── image-worker.js       # Lógica de procesamiento de imágenes (web worker)
│   ├── worker-manager.js     # Gestión de workers
│   ├── script.js             # Script principal (punto de entrada)
│   ├── style.css             # Estilos adicionales y personalizados
│   └── init/                 # Inicialización de la app
│
├── public/                   # Recursos públicos (favicon, etc.)
├── dist/                     # Archivos generados tras el build (para producción)
├── package.json              # Dependencias y scripts de npm
├── vite.config.js            # Configuración de Vite
├── tailwind.config.js        # Configuración de Tailwind CSS
├── postcss.config.js         # Configuración de PostCSS
└── .gitignore                # Archivos y carpetas ignorados por git
```

## Instalación y uso local

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/AlexisM23/image-converter.git
   cd image-converter
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Esto abrirá la aplicación en tu navegador en modo desarrollo.

4. **Compila para producción:**
   ```bash
   npm run build
   ```
   Los archivos listos para producción se generarán en la carpeta `dist/`.

## Despliegue en GitHub Pages

1. Ejecuta el build (`npm run build`).
2. Sube el contenido de la carpeta `dist/` a la rama `gh-pages` de tu repositorio, o configura GitHub Pages para servir desde esa carpeta.
3. La aplicación estará disponible online como un sitio estático, accesible desde la URL proporcionada por GitHub Pages.

## Contribución

Las contribuciones son bienvenidas. Si tienes ideas para nuevas funcionalidades, mejoras en la interfaz o corrección de errores, no dudes en abrir un issue o enviar un pull request. Por favor, mantén la coherencia en el estilo de código y la filosofía minimalista de la interfaz.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.

## Notas finales

- El diseño prioriza la experiencia de usuario y la claridad visual.
- No se almacena ninguna imagen ni dato del usuario en servidores externos; todo el procesamiento ocurre localmente en el navegador.
- Si tienes sugerencias, comentarios o encuentras algún problema, por favor comunícalo a través de la sección de issues del repositorio.
