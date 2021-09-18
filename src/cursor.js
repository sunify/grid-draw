import { isTooBright, SCALE_FACTOR } from "./helpers";

export function makeBrushCursor(target) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  return {
    update(size) {
      canvas.width = size * 2 + 4;
      canvas.height = canvas.width;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, size + 1, 0, Math.PI * 2);
      ctx.stroke();
      const cursorStyle = `url(${canvas.toDataURL()}) ${Math.floor(
        canvas.width / 2
      )} ${Math.floor(canvas.height / 2)}, auto`;
      target.style.cursor = cursorStyle;
    }
  };
}
