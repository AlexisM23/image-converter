// Gestión de object URLs y memoria para blobs
const memoryManager = {
  objectUrls: new Set(),
  stats: { created: 0, revoked: 0, leaked: 0 },

  createObjectURL(blob) {
    const url = URL.createObjectURL(blob);
    this.objectUrls.add(url);
    this.stats.created++;
    return url;
  },

  revokeObjectURL(url) {
    if (this.objectUrls.has(url)) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
      this.stats.revoked++;
    }
  },

  cleanup() {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.stats.leaked = this.objectUrls.size;
    this.objectUrls.clear();
    console.log('Memory manager stats:', this.stats);
  },

  getStats() {
    return { ...this.stats, active: this.objectUrls.size };
  }
};

export default memoryManager;