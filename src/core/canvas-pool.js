// Pool de canvas optimizado para reutilización
const canvasPool = {
  pool: new Map(), // Usar Map para mejor rendimiento
  maxSize: 10, // Aumentar tamaño del pool
  stats: { created: 0, reused: 0, discarded: 0 },

  getCanvas(width, height) {
    const key = `${width}x${height}`;
    let canvas = this.pool.get(key);

    if (canvas) {
      this.pool.delete(key);
      this.stats.reused++;
      return canvas;
    }

    // Crear nuevo canvas
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    this.stats.created++;
    return canvas;
  },

  returnCanvas(canvas) {
    const key = `${canvas.width}x${canvas.height}`;

    if (this.pool.size < this.maxSize) {
      // Limpiar el canvas
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.pool.set(key, canvas);
    } else {
      this.stats.discarded++;
    }
  },

  // Método para limpiar el pool
  cleanup() {
    this.pool.clear();
    console.log('Canvas pool stats:', this.stats);
  },

  // Método para obtener estadísticas
  getStats() {
    return { ...this.stats, poolSize: this.pool.size };
  }
};

export default canvasPool;