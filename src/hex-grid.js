import { Hexagon } from "./grid";
import { SCALE_FACTOR } from "./helpers";

function sign(a, b, c) {
  return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
}

function isInTriangle(p, tri) {
  const d1 = sign(p, tri.a, tri.b);
  const d2 = sign(p, tri.b, tri.c);
  const d3 = sign(p, tri.c, tri.a);

  const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
  const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(has_neg && has_pos);
}

function isPosHex(pos, hex) {
  return (
    pos.x >= hex.left &&
    pos.x <= hex.left + hex.width &&
    pos.y >= hex.top &&
    pos.y <= hex.top + hex.height
  );
}

function findTriangle(grid, pos) {
  for (const hex of grid.filter((hex) => isPosHex(pos, hex))) {
    const i = hex.triangles.findIndex((tri) => isInTriangle(pos, tri));
    if (i > -1) {
      return [hex, i];
    }
  }
  return [null, null];
}

export class HexagonalGrid {
  constructor(cellSize, caleido = false) {
    this.pieceCanvas = document.createElement("canvas");
    this.pieceCtx = this.pieceCanvas.getContext("2d");
    this.pieceCanvas.width = 500;
    this.pieceCanvas.height = this.pieceCanvas.width;
    this.flipCanvas = document.createElement("canvas");
    this.flipCtx = this.flipCanvas.getContext("2d");
    this.hexCanvas = document.createElement("canvas");
    this.hexCtx = this.hexCanvas.getContext("2d");

    this.grid = [];
    this.cellSize = cellSize;
    this.caleido = caleido;
  }

  _calcGrid() {
    this.sample = new Hexagon(0, 0, this.cellSize);
    this.grid.splice(0);
    let y = -this.sample.height;
    let i = 0;
    // todo: try to go without a lot of hexes again
    while (y < window.innerHeight) {
      let x = -this.sample.width - (i % 2 ? this.sample.width / 2 : 0);
      while (x < window.innerWidth) {
        this.grid.push(new Hexagon(x, y, this.cellSize));
        x += this.sample.width - 1;
      }
      y += this.sample.height - this.sample.height / 4;
      i += 1;
    }
    this.hexCanvas.width = this.sample.width * SCALE_FACTOR;
    this.hexCanvas.height = this.sample.height * SCALE_FACTOR;
  }

  set cellSize(cellSize) {
    this._cellSize = cellSize;
    this._calcGrid();
  }

  get cellSize() {
    return this._cellSize;
  }

  translatePosition(pos) {
    const [hexagon, i] = findTriangle(this.grid, pos);
    const triangle = hexagon.triangles[i];
    if (triangle) {
      const local = pos.clone().sub(hexagon.center).mult(SCALE_FACTOR);
      local.angle -= triangle.angle - Math.PI / 4;
      if (i % 2 && this.caleido) {
        local.angle = Math.PI / 2 - local.angle;
      }
      return local;
    }

    return null;
  }

  renderGrid(ctx) {
    this.grid.forEach((hex) => {
      ctx.beginPath();
      ctx.lineWidth = SCALE_FACTOR;
      ctx.arc(
        hex.center.x * SCALE_FACTOR,
        hex.center.y * SCALE_FACTOR,
        5 * SCALE_FACTOR,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      hex.triangles.forEach((t) => {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(t.a.x * SCALE_FACTOR, t.a.y * SCALE_FACTOR);
        ctx.lineTo(t.b.x * SCALE_FACTOR, t.b.y * SCALE_FACTOR);
        ctx.lineTo(t.c.x * SCALE_FACTOR, t.c.y * SCALE_FACTOR);
        ctx.lineTo(t.a.x * SCALE_FACTOR, t.a.y * SCALE_FACTOR);
        ctx.stroke();
      });
    });
  }

  clean() {
    this.pieceCanvas.width = this.pieceCanvas.width;
  }

  resize() {
    this._calcGrid();
  }

  render(ctx) {
    this.hexCanvas.width = this.hexCanvas.width;

    if (this.caleido) {
      this.flipCanvas.width = this.pieceCanvas.width;
      this.flipCanvas.height = this.pieceCanvas.height;
      this.flipCtx.save();
      this.flipCtx.scale(-1, 1);
      this.flipCtx.rotate(Math.PI / 2);
      this.flipCtx.drawImage(this.pieceCanvas, 0, 0);
      this.flipCtx.restore();
    }

    this.sample.triangles.forEach((tri, i) => {
      this.hexCtx.save();
      this.hexCtx.translate(
        this.hexCanvas.width / 2,
        this.hexCanvas.height / 2
      );
      let angle = tri.angle - Math.PI / 4 - (Math.PI * 2) / 6;
      this.hexCtx.rotate(angle);
      this.hexCtx.drawImage(
        i % 2 || !this.caleido ? this.pieceCanvas : this.flipCanvas,
        0,
        0
      );
      this.hexCtx.restore();
    });

    this.grid.forEach((hex) => {
      ctx.drawImage(
        this.hexCanvas,
        hex.boundingBox[0] * SCALE_FACTOR,
        hex.boundingBox[1] * SCALE_FACTOR,
        this.hexCanvas.width,
        this.hexCanvas.height
      );
    });
  }
}
