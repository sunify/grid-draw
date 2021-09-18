export const isTooBright = (color) => color.reduce((a, b) => a + b, 0) > 340;
export const SCALE_FACTOR = 2; // todo: calc from dpi

const downloadLink = document.createElement("a");
document.body.appendChild(downloadLink);
downloadLink.style = "display: none";
export function downloadCanvas(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `${filename}.png`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export function rgba(color, alpha = 1) {
  return `rgba(${color.join(",")}, ${alpha})`;
}
