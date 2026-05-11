export async function compressImage(file, maxWidthPx = 1200) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= maxWidthPx) {
        resolve(file);
        return;
      }
      const scale = maxWidthPx / img.width;
      const canvas = document.createElement('canvas');
      canvas.width = maxWidthPx;
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg',
        0.85,
      );
    };
    img.src = url;
  });
}
