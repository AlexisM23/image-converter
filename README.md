# Image Converter

Este proyecto es una aplicación web avanzada y minimalista para la conversión y edición de imágenes directamente en el navegador. Su diseño y arquitectura priorizan la experiencia de usuario, la eficiencia y la claridad visual, integrando tecnologías modernas y librerías de alto rendimiento.

## Descripción general

Image Converter permite a los usuarios cargar imágenes, convertirlas entre distintos formatos y editarlas mediante un sistema de filtros avanzado integrado, todo sin salir del navegador ni instalar software adicional. La interfaz es minimalista, basada en iconos y tooltips, y evita cualquier elemento visual innecesario. El sistema incluye un editor de imágenes nativo con filtros inteligentes, detección de cambios y compatibilidad completa con formatos de exportación.

## Características técnicas principales

- **Conversión entre formatos**: Soporta múltiples formatos de imagen (PNG, JPEG, WebP, ICO, AVIF, TIFF, entre otros) con configuraciones específicas para cada formato.
- **Editor de imágenes nativo**: Sistema de filtros avanzado con formato cuadrado, escala de grises, reducción de resolución y más, aplicados de forma secuencial y sin degradación.
- **Detección inteligente de cambios**: Solo actualiza la imagen cuando hay modificaciones reales, evitando procesamiento innecesario y manteniendo la calidad original.
- **Compatibilidad .ICO**: Mapeo inteligente de resoluciones del editor a tamaños de icono estándar, con exportación optimizada para múltiples resoluciones.
- **Gestión de contexto por archivo**: Cada imagen mantiene su propio estado de filtros y configuración, permitiendo edición simultánea de múltiples archivos.
- **Canvas con dimensiones fijas**: Sistema de visualización que separa la capa de presentación de los datos de imagen, garantizando exportación con dimensiones reales.
- **Procesamiento eficiente**: Uso de Web Workers para operaciones pesadas, evitando bloqueos en la interfaz.
- **Carga dinámica de dependencias**: Las librerías pesadas se cargan solo cuando son necesarias, optimizando el rendimiento inicial.
- **Interfaz minimalista**: Solo iconos, tooltips y una barra de herramientas compacta superpuesta a la imagen.
- **Soporte para modo oscuro**: Adaptación automática de la interfaz según el tema del sistema o preferencia del usuario.
- **Registros claros**: Los mensajes de estado y logs son concisos, sin emojis ni texto redundante.
- **Procesamiento local**: Ningún archivo se sube a servidores externos; todo ocurre en el navegador.

## Tecnologías y librerías utilizadas

- **HTML5** y **CSS3** (Tailwind CSS para estilos utilitarios y personalizados).
- **JavaScript** moderno (ES6+) con principios SOLID/DRY/KISS aplicados estrictamente.
- **Vite** como bundler y servidor de desarrollo.
- **browser-image-compression** para compresión eficiente de imágenes.
- **Web Workers** para procesamiento paralelo.
- **Canvas API** nativo para manipulación de imágenes y filtros.
- **Arquitectura modular**: Separación clara entre lógica, configuración, utilidades y componentes visuales.
- **Sistema de configuración global**: Valores centralizados y reutilizables para todos los componentes.
- **Gestión de estado avanzada**: Contextos por archivo con detección de cambios inteligente.

## Detalles de implementación

### Sistema de Editor de Imágenes Nativo

- **Arquitectura modular**: El editor está construido con principios SOLID/DRY/KISS, separando responsabilidades en componentes especializados.
- **CanvasManager**: Gestiona el canvas principal con dimensiones fijas (800x600) que actúa como capa de visualización, separada de los datos reales de imagen.
- **FilterEngine**: Motor de filtros que aplica transformaciones de forma secuencial y segura, incluyendo formato cuadrado, escala de grises y reducción de resolución.
- **FileContextManager**: Mantiene contextos individuales por archivo, permitiendo edición simultánea de múltiples imágenes sin interferencias.
- **ChangeDetector**: Sistema inteligente que detecta cambios reales en los datos de imagen, evitando actualizaciones innecesarias y degradación progresiva.
- **IcoCompatibilityManager**: Mapea resoluciones del editor a tamaños de icono estándar, garantizando compatibilidad completa con exportación .ICO.

### Sistema de Filtros Avanzado

- **Filtro de Formato Cuadrado**: Convierte imágenes a formato cuadrado manteniendo la proporción y centrando el contenido.
- **Filtro de Escala de Grises**: Aplica conversión a escala de grises con intensidad configurable.
- **Filtro de Resolución**: Reduce la resolución de la imagen con factores de escala predefinidos (25%, 50%, 100%) y calidad configurable.
- **Aplicación Secuencial**: Los filtros se aplican en orden específico para garantizar resultados consistentes y predecibles.
- **Validación de Parámetros**: Cada filtro valida sus parámetros contra configuraciones globales, asegurando valores seguros y compatibles.

### Gestión de Configuración Global

- **Configuración Centralizada**: Todos los valores de configuración están centralizados en `src/config/`, siguiendo principios DRY.
- **Formatos de Imagen**: Configuraciones específicas para cada formato (PNG, JPEG, WebP, ICO, AVIF, TIFF) con parámetros optimizados.
- **Canvas y Calidad**: Configuraciones globales para dimensiones de canvas, calidad de exportación y parámetros de renderizado.
- **Compatibilidad ICO**: Mapeo de resoluciones del editor a tamaños de icono estándar, con soporte para múltiples resoluciones simultáneas.

### Procesamiento y conversión

- **Compresión inteligente**: La conversión se realiza mediante `browser-image-compression` con configuraciones específicas por formato, incluyendo manejo robusto de formatos sin calidad (como PNG).
- **Exportación con dimensiones reales**: El sistema exporta imágenes editadas con sus dimensiones reales, no las dimensiones del canvas de visualización, garantizando calidad y precisión.
- **Web Workers**: Para conversiones complejas o múltiples, se utilizan Web Workers gestionados por `worker-manager.js`, evitando bloqueos en la interfaz.
- **Gestión de memoria**: Sistema avanzado de gestión de blobs y URLs temporales que previene fugas de memoria y optimiza el rendimiento.
- **Detección de cambios**: Solo procesa y convierte cuando hay modificaciones reales, evitando operaciones redundantes.

### Interfaz y experiencia de usuario

- **Diseño minimalista**: La interfaz está construida sobre Tailwind CSS, con estilos personalizados para sliders, listas de archivos, botones y modales.
- **Iconografía consistente**: Todos los botones son iconográficos, con tooltips explicativos y sin texto visible, siguiendo una filosofía minimalista.
- **Modo oscuro inteligente**: Se aplica automáticamente y afecta tanto a la interfaz principal como al editor de imágenes, con transiciones suaves.
- **Notificaciones discretas**: Los mensajes de error y éxito se muestran mediante notificaciones visuales discretas, sin emojis ni elementos distractores.
- **Editor modal avanzado**: Interfaz de edición con toggles para filtros, preview en tiempo real y controles intuitivos.
- **Feedback visual**: Indicadores de progreso, estados de carga y confirmaciones visuales para todas las operaciones.

## Estructura del proyecto

```
image-converter/
│
├── index.html                # Entrada principal de la aplicación
├── src/                      # Código fuente principal
│   ├── config/               # Configuraciones globales centralizadas
│   │   ├── canvas-config.js  # Configuración de canvas y calidad
│   │   ├── config.js         # Configuración general y seguridad
│   │   ├── format-configs.js # Configuraciones específicas por formato
│   │   └── tooltips.js       # Descripciones de tooltips
│   ├── core/                 # Núcleo: gestión de estado, memoria, métricas, lazy loading, etc.
│   ├── image-editor/         # Sistema de editor de imágenes nativo
│   │   ├── config/           # Configuración específica del editor
│   │   ├── core/             # Componentes principales del editor
│   │   │   ├── CanvasManager.js      # Gestión de canvas con dimensiones fijas
│   │   │   ├── ChangeDetector.js     # Detección inteligente de cambios
│   │   │   ├── FileContextManager.js # Gestión de contexto por archivo
│   │   │   ├── FilterEngine.js       # Motor de filtros secuencial
│   │   │   └── IcoCompatibilityManager.js # Compatibilidad con .ICO
│   │   ├── filters/          # Filtros de imagen implementados
│   │   │   ├── BaseFilter.js         # Clase base para filtros
│   │   │   ├── GrayscaleFilter.js    # Filtro de escala de grises
│   │   │   ├── ResolutionFilter.js   # Filtro de reducción de resolución
│   │   │   ├── SquareFilter.js       # Filtro de formato cuadrado
│   │   │   └── index.js              # Exportaciones de filtros
│   │   ├── ui/               # Componentes de interfaz del editor
│   │   │   ├── EditorModal.js        # Modal principal del editor
│   │   │   └── FilterToggle.js       # Toggle para activar/desactivar filtros
│   │   ├── utils/            # Utilidades específicas del editor
│   │   │   └── IconLibrary.js        # Biblioteca de iconos
│   │   └── index.js          # Punto de entrada del sistema de editor
│   ├── handlers/             # Manejadores de eventos
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

## Características avanzadas

### Sistema de Filtros Inteligente
- **Aplicación secuencial**: Los filtros se aplican en orden específico para garantizar resultados consistentes.
- **Validación de parámetros**: Cada filtro valida sus parámetros contra configuraciones globales.
- **Detección de cambios**: Solo actualiza cuando hay modificaciones reales, evitando degradación progresiva.
- **Compatibilidad ICO**: Mapeo automático de resoluciones a tamaños de icono estándar.

### Arquitectura Robusta
- **Principios SOLID/DRY/KISS**: Código mantenible, extensible y fácil de entender.
- **Configuración global**: Valores centralizados y reutilizables para todos los componentes.
- **Gestión de contexto**: Cada archivo mantiene su propio estado de filtros y configuración.
- **Exportación precisa**: Imágenes exportadas con dimensiones reales, no del canvas de visualización.

### Optimizaciones de Rendimiento
- **Web Workers**: Procesamiento paralelo para operaciones pesadas.
- **Lazy Loading**: Carga dinámica de dependencias solo cuando son necesarias.
- **Gestión de memoria**: Sistema avanzado que previene fugas de memoria.
- **Detección inteligente**: Evita operaciones redundantes y actualizaciones innecesarias.

## Notas finales

- El diseño prioriza la experiencia de usuario, la claridad visual y la eficiencia técnica.
- No se almacena ninguna imagen ni dato del usuario en servidores externos; todo el procesamiento ocurre localmente en el navegador.
- El sistema está construido con principios de arquitectura de software modernos, garantizando mantenibilidad y escalabilidad.
- Si tienes sugerencias, comentarios o encuentras algún problema, por favor comunícalo a través de la sección de issues del repositorio.
