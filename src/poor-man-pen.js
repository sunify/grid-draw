import { SCALE_FACTOR } from "./helpers";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

function lerpV(v1, v2, t) {
  return v1.clone().add(v2.clone().sub(v1).mult(t));
}

export class PoorManPen {
  constructor(size, color) {
    this.size = size;
    this.color = color;
    this._drawing = false;
    this.prevPos = null;
  }

  startStroke() {
    this._drawing = true;
    this.prevPos = null;
  }

  endStroke() {
    this._drawing = true;
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
    if (this.prevPos) {
      const steps = Math.floor(
        pos.clone().sub(this.prevPos).magnitude / (this.size * 0.75)
      );
      for (let i = 0; i < steps; i += 1) {
        const interStep = lerpV(this.prevPos, pos, i / steps);
        ctx.beginPath();
        ctx.arc(
          interStep.x,
          interStep.y,
          this.size * SCALE_FACTOR,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.size * SCALE_FACTOR, 0, Math.PI * 2);
    ctx.fill();
    this.prevPos = pos;
  }
}
