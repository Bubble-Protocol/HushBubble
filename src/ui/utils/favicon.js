import favicon from '../assets/img/favicon.ico';

export function setFaviconWithCount(count) {
  if (count > 99) count = 99;

  const canvas = document.getElementById('notificationCanvas');
  const ctx = canvas.getContext('2d');

  // Load the original favicon image
  const faviconImg = new Image();
  faviconImg.src = favicon;

  // When the image is loaded, draw it on the canvas
  faviconImg.onload = () => {
    ctx.drawImage(faviconImg, 0, 0, canvas.width, canvas.height);

    if (count > 0) {
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const textWidth = ctx.measureText(count).width;

      if (count > 9) {
        // Draw rounded rectangle background
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.roundRect(canvas.width - textWidth - 10, canvas.height - 21, textWidth + 10, 21, 12);
        ctx.stroke();
        ctx.fill();
      } else {
        // Draw circle background
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(canvas.width - 11, canvas.height - 11, 12, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.fillStyle = 'white';
      ctx.fillText(count, canvas.width - textWidth - 5, canvas.height - 20);
    }

    // Set the generated favicon as the new favicon
    const newFavicon = canvas.toDataURL('image/png');
    const favicon = document.getElementById('favicon');
    favicon.href = newFavicon;
  };
}

