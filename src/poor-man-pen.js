import { SCALE_FACTOR } from "./helpers";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

export class PoorManPen {
  constructor(size, color) {
    this.size = size;
    this.color = color;
  }

  get cursor() {
    canvas.width = this.size * 2 + 4;
    canvas.height = canvas.width;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, this.size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, this.size + 1, 0, Math.PI * 2);
    ctx.stroke();
    const cursorStyle = `url(${canvas.toDataURL()}) ${Math.floor(
      canvas.width / 2
    )} ${Math.floor(canvas.height / 2)}, auto`;
    return cursorStyle;
  }

  draw(ctx, pos) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.size * SCALE_FACTOR, 0, Math.PI * 2);
    ctx.fill();
  }
}
