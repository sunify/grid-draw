import { Vector } from "v-for-vector";
import { SCALE_FACTOR } from "./helpers";

export class PolarGrid {
  constructor(pieceCtx, cellSize, caleido = false, sectionsCount) {
    this.cellSize = cellSize;
    this.caleido = caleido;
    this.pieceCtx = pieceCtx;
    this.flipCanvas = document.createElement("canvas");
    this.flipCtx = this.flipCanvas.getContext("2d");

    this.sectionsCount = sectionsCount;
  }

  translatePosition(pos) {
    const center = Vector.cartesian(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    const local = pos.clone().sub(center).mult(SCALE_FACTOR);
    const baseAngle = (Math.PI * 2) / this.sectionsCount;
    const section = Math.floor((local.angle + Math.PI) / baseAngle);
    const angle = section * baseAngle;
    local.angle -= angle - Math.PI;
    // if (this.caleido && section % 2 === 1) {
    //   local.angle -= Math.PI * 2;
    // }
    return local;
  }

  renderGrid(ctx) {
    ctx.beginPath();
    const center = Vector.cartesian(
      window.innerWidth / 2,
      window.innerHeight / 2
    ).mult(SCALE_FACTOR);
    ctx.arc(center.x, center.y, 5 * SCALE_FACTOR, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < this.sectionsCount; i += 1) {
      const angle = ((Math.PI * 2) / this.sectionsCount) * i;
      const point = Vector.polar(angle, 10000).add(center);
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  }

  resize() {}

  render(ctx) {
    const { flipCtx, flipCanvas, pieceCtx } = this;
    const pieceCanvas = pieceCtx.canvas;

    if (this.caleido) {
      flipCanvas.width = pieceCanvas.width;
      flipCanvas.height = pieceCanvas.height;
      flipCtx.save();
      flipCtx.scale(-1, 1);
      flipCtx.rotate(Math.PI / 2);
      flipCtx.drawImage(pieceCanvas, 0, 0);
      flipCtx.restore();
    }

    for (let i = 0; i < this.sectionsCount; i += 1) {
      const angle = ((Math.PI * 2) / this.sectionsCount) * i;
      ctx.save();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.rotate(angle);
      ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
      ctx.drawImage(
        i % 2 || !this.caleido ? pieceCanvas : flipCanvas,
        0,
        0,
        pieceCanvas.width,
        pieceCanvas.height,
        (ctx.canvas.width - pieceCanvas.width) / 2,
        (ctx.canvas.height - pieceCanvas.height) / 2,
        pieceCanvas.width,
        pieceCanvas.height
      );
      ctx.restore();
    }
  }
}
