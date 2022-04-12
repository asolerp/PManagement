export const parseImages = (imgs) => {
  return imgs.map((image, i) => ({
    fileName: image?.fileName || `image-${i}`,
    fileUri: image?.uri,
    fileType: image?.type,
  }));
};
