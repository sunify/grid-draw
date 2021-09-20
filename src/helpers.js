export const isTooBright = (color) => color.reduce((a, b) => a + b, 0) > 340;

export const SCALE_FACTOR = (() => {
  const ctx = document.createElement("canvas").getContext("2d"),
    dpr = window.devicePixelRatio || 1,
    bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;

  return dpr / bsr;
})();

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

export function lerpV(v1, v2, t) {
  return v1.clone().add(v2.clone().sub(v1).mult(t));
}
