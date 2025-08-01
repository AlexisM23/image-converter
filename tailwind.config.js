/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,css}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
    // Safelist para clases dinámicas esenciales
  safelist: [
    'format-option',
    'file-list-item',
    'file-preview-thumbnail',
    'tooltip-text',
    'slider',
    'cropper-container',
    'tie-icon',
    'icon-bubble',
    'btn-primary',
    'btn-secondary',
    'loading-spinner',
    'error-message',
    'success-message',
    'notification-enter',
    'notification-exit',
    'modal-fade-in',
    'dark',
    'hidden',
    'visible',
    'block',
    'inline',
    'flex',
    'grid',
    'absolute',
    'relative',
    'fixed',
    'sticky'
  ],
}