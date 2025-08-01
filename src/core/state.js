import CONFIG from '../config/config.js';

const state = {
  currentFiles: [],
  isConverting: { value: false },
  currentFormatConfig: null,
  lastConversionTime: { value: 0 },
  securityToken: { value: null },
  workerManager: null,
  CONFIG
};

export default state;