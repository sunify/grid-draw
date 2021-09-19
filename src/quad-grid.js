import { Vector } from "v-for-vector";
import { SCALE_FACTOR } from "./helpers";

export class QuadGrid {
  constructor(pieceCtx, cellSize, caleido = false) {
    this.pieceCtx = pieceCtx;
    this.flipCanvas = document.createElement("canvas");
    this.flipCtx = this.flipCanvas.getContext("2d");
    this.cellCanvas = document.createElement("canvas");
    this.cellCtx = this.cellCanvas.getContext("2d");

    this.grid = [];
    this.cellSize = cellSize;
    this.caleido = caleido;
  }

  _calcGrid() {
    this.cellCanvas.width = this.cellSize * SCALE_FACTOR;
    this.cellCanvas.height = this.cellSize * SCALE_FACTOR;
  }

  set cellSize(cellSize) {
    this._cellSize = cellSize;
    this._calcGrid();
  }

  get cellSize() {
    return this._cellSize;
  }

  get drawingContext() {
    return this.pieceCtx;
  }

  translatePosition(pos) {
    const { cellSize } = this;
    const half = cellSize / 2;
    const x = Math.floor(pos.x / cellSize) * cellSize;
    const y = Math.floor(pos.y / cellSize) * cellSize;
    const center = Vector.cartesian(x, y).add(half);
    const local = pos.clone().sub(center).mult(SCALE_FACTOR);
    let q = 0;
    // i'm stupid :(
    if (local.y < 0) {
      q = local.x < 0 ? 2 : 3;
    } else {
      q = local.x < 0 ? 1 : 0;
    }
    local.angle -= (Math.PI / 2) * q;
    if (q % 2 === 0 && this.caleido) {
      local.angle = Math.PI / 2 - local.angle;
    }

    return local;
  }

  renderGrid(ctx) {
    this.cellCanvas.width = this.cellCanvas.width;
    const { cellCtx } = this;

    cellCtx.strokeStyle = ctx.strokeStyle;
    cellCtx.beginPath();
    cellCtx.arc(
      (this.cellSize / 2) * SCALE_FACTOR,
      (this.cellSize / 2) * SCALE_FACTOR,
      5 * SCALE_FACTOR,
      0,
      Math.PI * 2
    );
    cellCtx.stroke();

    cellCtx.beginPath();
    cellCtx.moveTo(0, 0);
    cellCtx.lineTo(this.cellSize * SCALE_FACTOR, 0);
    cellCtx.stroke();

    cellCtx.beginPath();
    cellCtx.moveTo(0, 0);
    cellCtx.lineTo(0, this.cellSize * SCALE_FACTOR);
    cellCtx.stroke();

    cellCtx.beginPath();
    cellCtx.moveTo((this.cellSize / 2) * SCALE_FACTOR, 0);
    cellCtx.lineTo(
      (this.cellSize / 2) * SCALE_FACTOR,
      this.cellSize * SCALE_FACTOR
    );
    cellCtx.stroke();

    cellCtx.beginPath();
    cellCtx.moveTo(0, (this.cellSize / 2) * SCALE_FACTOR);
    cellCtx.lineTo(
      this.cellSize * SCALE_FACTOR,
      (this.cellSize / 2) * SCALE_FACTOR
    );
    cellCtx.stroke();

    const pattern = ctx.createPattern(this.cellCanvas, "repeat");
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

  resize() {
    this._calcGrid();
  }

  render(ctx) {
    const { cellCanvas, cellCtx, flipCtx, flipCanvas, pieceCtx } = this;
    cellCanvas.width = this.cellCanvas.width;
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

    for (let i = 0; i < 4; i += 1) {
      const angle = ((Math.PI * 2) / 4) * i;

      cellCtx.save();
      cellCtx.translate(cellCanvas.width / 2, cellCanvas.height / 2);
      cellCtx.rotate(angle);
      cellCtx.translate(-cellCanvas.width / 2, -cellCanvas.height / 2);
      cellCtx.drawImage(
        i % 2 || !this.caleido ? pieceCanvas : flipCanvas,
        0,
        0,
        pieceCanvas.width,
        pieceCanvas.height,
        (cellCanvas.width - pieceCanvas.width) / 2,
        (cellCanvas.height - pieceCanvas.height) / 2,
        pieceCanvas.width,
        pieceCanvas.height
      );
      cellCtx.restore();
    }

    const pattern = ctx.createPattern(this.cellCanvas, "repeat");
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }
}
