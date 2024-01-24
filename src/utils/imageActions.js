export const imageActions = {
  common: {
    saveToPhotos: true,
    mediaType: 'photo',
    includeBase64: false,
    timestamp: true,
  },
  capture: {
    saveToPhotos: true,
    mediaType: 'photo',
    includeBase64: true,
    // includeExtra: true,
    timestamp: true,
  },
  library: {
    selectionLimit: 1,
    mediaType: 'photo',
    includeBase64: true,
    includeExtra: true,
    timestamp: true,
  },
};
