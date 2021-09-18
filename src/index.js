import "./styles.css";

import runWithFps from "run-with-fps";
import { Vector } from "v-for-vector";
import { Hexagon } from "./grid";
import { downloadCanvas, isTooBright, SCALE_FACTOR } from "./helpers";
import { makeBrushCursor } from "./cursor";
import { params, onParamChange, onErase, onDownload } from "./params";

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * SCALE_FACTOR;
canvas.height = window.innerHeight * SCALE_FACTOR;
canvas.style.positon = "absolute";
canvas.style.width = "100%";
canvas.style.height = "100%";

/**
 * ToDo:
 * - [*] ресайз CELL_SIZE через dat.gui
 * - [*] курсор-рисовалка
 * - [*] caleido
 * - [*] сохранять настройки в localStorage
 * - [*] добавить прозрачность для кисти
 * - [*] скачивание результ'та'''''
 * - [*] поправить размеры курсора
 * - [ ] вынести логику сетки (создания, вычисления координат на pieceCanvas) в отдельный модуль
 * - [ ] попробовать реализовать другую сетку (квадратную?)
 * - [ ] центральная сетка (когда экран разбит на секторы из центра)
 */

const brushCursor = makeBrushCursor(canvas);
brushCursor.update(params.penWidth);

const nonRerenderParams = ["penWidth", "foregroundColor", "foregroundAlpha"];
onParamChange((param) => {
  if (param === "penWidth") {
    brushCursor.update(params.penWidth);
  }
  if (param === "cellSize") {
    sample.size = params.cellSize;
    hexCanvas.width = sample.width * SCALE_FACTOR;
    hexCanvas.height = sample.height * SCALE_FACTOR;
    calcGrid();
  }

  if (!nonRerenderParams.includes(param)) {
    forceRender();
  }
});

onErase(() => {
  pieceCanvas.width = pieceCanvas.width;
  forceRender();
});

onDownload(() => {
  downloadCanvas(canvas, Date.now());
});

const grid = [];

const sample = new Hexagon(0, 0, params.cellSize);
function calcGrid() {
  grid.splice(0);
  let y = -sample.height;
  let i = 0;
  // todo: try to go without a lot of hexes again
  while (y < window.innerHeight) {
    let x = -sample.width - (i % 2 ? sample.width / 2 : 0);
    while (x < window.innerWidth) {
      grid.push(new Hexagon(x, y, params.cellSize));
      x += sample.width - 1;
    }
    y += sample.height - sample.height / 4;
    i += 1;
  }
}
calcGrid();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth * SCALE_FACTOR;
  canvas.height = window.innerHeight * SCALE_FACTOR;
  requestAnimationFrame(() => {
    calcGrid();
    forceRender();
  });
});

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

const pieceCanvas = document.createElement("canvas");
const pieceCtx = pieceCanvas.getContext("2d");
pieceCanvas.width = 500;
pieceCanvas.height = pieceCanvas.width;
const flipCanvas = document.createElement("canvas");
const flipCtx = flipCanvas.getContext("2d");

// document.body.appendChild(flipCanvas);
// document.body.appendChild(pieceCanvas);
// flipCanvas.style.position = "fixed";
// flipCanvas.style.left = "0";
// flipCanvas.style.top = "0";
// flipCanvas.style.pointerEvents = "none";
// flipCanvas.style.background = "rgba(255, 0, 255, 0.5)";
// pieceCanvas.style.position = "fixed";
// pieceCanvas.style.right = "0";
// pieceCanvas.style.bottom = "0";
// pieceCanvas.style.pointerEvents = "none";
// pieceCanvas.style.background = "rgba(255, 0, 255, 0.5)";

const hexCanvas = document.createElement("canvas");
const hexCtx = hexCanvas.getContext("2d");
hexCanvas.width = sample.width * SCALE_FACTOR;
hexCanvas.height = sample.height * SCALE_FACTOR;

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

function getGridPos(grid, pos) {
  const [hexagon, i] = findTriangle(grid, pos);
  const triangle = hexagon.triangles[i];
  if (triangle) {
    const local = pos.clone().sub(hexagon.center).mult(SCALE_FACTOR);
    local.angle -= triangle.angle - Math.PI / 4;
    if (i % 2 && params.caleido) {
      local.angle = Math.PI / 2 - local.angle;
    }
    return local;
  }

  return null;
}

function rgba(color, alpha = 1) {
  return `rgba(${color.join(",")}, ${alpha})`;
}

function drawLine() {
  requestAnimationFrame(() => {
    const piecePos = getGridPos(grid, pointer);

    if (piecePos) {
      // todo: better line drawing
      pieceCtx.fillStyle = rgba(params.foregroundColor, params.foregroundAlpha);
      pieceCtx.beginPath();
      pieceCtx.arc(
        piecePos.x,
        piecePos.y,
        params.penWidth * SCALE_FACTOR,
        0,
        Math.PI * 2
      );
      pieceCtx.fill();
    }
    forceRender();
  });
}

let inDraw = false;
let shouldRender = true;
function forceRender() {
  shouldRender = true;
}
canvas.addEventListener("mousedown", (e) => {
  inDraw = true;
  pointer.x = e.pageX;
  pointer.y = e.pageY;
  drawLine();
});
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    e.preventDefault();
    inDraw = true;
    pointer.x = e.pageX;
    pointer.y = e.pageY;
    drawLine();
  }
});
document.addEventListener("mouseup", () => {
  inDraw = false;
});
document.addEventListener("touchend", () => {
  inDraw = false;
});
const pointer = Vector.cartesian(0, 0);
const handleMove = (e) => {
  pointer.x = e.pageX;
  pointer.y = e.pageY;
  if (!inDraw) {
    return;
  }
  drawLine();
};

document.addEventListener("mousemove", handleMove);
document.addEventListener("touchmove", (e) => {
  e.preventDefault();
  handleMove(e);
});

runWithFps(() => {
  if (!shouldRender) {
    return false;
  }
  shouldRender = false;
  hexCanvas.width = hexCanvas.width;

  ctx.fillStyle = rgba(params.backgroundColor);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (params.caleido) {
    flipCanvas.width = pieceCanvas.width;
    flipCanvas.height = pieceCanvas.height;
    flipCtx.save();
    flipCtx.scale(-1, 1);
    flipCtx.rotate(Math.PI / 2);
    flipCtx.drawImage(pieceCanvas, 0, 0);
    flipCtx.restore();
  }

  sample.triangles.forEach((tri, i) => {
    hexCtx.save();
    hexCtx.translate(hexCanvas.width / 2, hexCanvas.height / 2);
    let angle = tri.angle - Math.PI / 4 - (Math.PI * 2) / 6;
    hexCtx.rotate(angle);
    hexCtx.drawImage(i % 2 || !params.caleido ? pieceCanvas : flipCanvas, 0, 0);
    hexCtx.restore();
  });

  grid.forEach((hex) => {
    if (params.showGrid) {
      if (isTooBright(params.backgroundColor)) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      }
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
      if (isTooBright(params.backgroundColor)) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      }
      hex.triangles.forEach((t) => {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(t.a.x * SCALE_FACTOR, t.a.y * SCALE_FACTOR);
        ctx.lineTo(t.b.x * SCALE_FACTOR, t.b.y * SCALE_FACTOR);
        ctx.lineTo(t.c.x * SCALE_FACTOR, t.c.y * SCALE_FACTOR);
        ctx.lineTo(t.a.x * SCALE_FACTOR, t.a.y * SCALE_FACTOR);
        ctx.stroke();
      });
    }
    ctx.drawImage(
      hexCanvas,
      hex.boundingBox[0] * SCALE_FACTOR,
      hex.boundingBox[1] * SCALE_FACTOR,
      hexCanvas.width,
      hexCanvas.height
    );
  });
}, 60);
