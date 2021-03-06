import { Vector } from "v-for-vector";
import smooth from "chaikin-smooth";
import { SCALE_FACTOR, lerpV } from "./helpers";

const cursorCanvas = document.createElement("canvas");
const cursorCtx = cursorCanvas.getContext("2d");

export class PoorManPen {
  constructor(drawingContext, size, color) {
    this.drawingContext = drawingContext;
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
    cursorCanvas.width = this.size * 2 + 4;
    cursorCanvas.height = cursorCanvas.width;
    cursorCtx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    cursorCtx.beginPath();
    cursorCtx.arc(
      cursorCanvas.width / 2,
      cursorCanvas.height / 2,
      this.size,
      0,
      Math.PI * 2
    );
    cursorCtx.stroke();
    cursorCtx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    cursorCtx.beginPath();
    cursorCtx.arc(
      cursorCanvas.width / 2,
      cursorCanvas.height / 2,
      this.size + 1,
      0,
      Math.PI * 2
    );
    cursorCtx.stroke();
    const cursorStyle = `url(${cursorCanvas.toDataURL()}) ${Math.floor(
      cursorCanvas.width / 2
    )} ${Math.floor(cursorCanvas.height / 2)}, auto`;
    return cursorStyle;
  }

  draw(grid, cursorPos) {
    const ctx = this.drawingContext;
    const pos = cursorPos.clone();
    const ctxCenter = Vector.cartesian(
      ctx.canvas.width / 2,
      ctx.canvas.height / 2
    );
    const localPos = grid.translatePosition(pos).add(ctxCenter);
    ctx.save();
    ctx.fillStyle = this.color;
    if (this.prevPos) {
      const strokeLength = pos.clone().sub(this.prevPos).magnitude;
      const steps = Math.floor(strokeLength / (this.size * 0.5));
      for (let i = 0; i < steps; i += 1) {
        const interStep = grid
          .translatePosition(lerpV(this.prevPos, pos, i / steps))
          .add(ctxCenter);
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
    ctx.arc(localPos.x, localPos.y, this.size * SCALE_FACTOR, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    this.prevPos = pos;
  }
}
