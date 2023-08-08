export function resizeImage(img, targetSize, format = "image/png", quality = 0.92) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  const maxSize = Math.max(img.width, img.height);
  const scaleFactor = targetSize / maxSize;
  
  const width = Math.floor(img.width * scaleFactor);
  const height = Math.floor(img.height * scaleFactor);
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL(format, quality);
}