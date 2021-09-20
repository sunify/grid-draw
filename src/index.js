import "./styles.css";

import runWithFps from "run-with-fps";
import { Vector } from "v-for-vector";
import { rgba, downloadCanvas, isTooBright, SCALE_FACTOR } from "./helpers";
import { params, onParamChange, onErase, onDownload } from "./params";
import { HexagonalGrid } from "./hex-grid";
import { QuadGrid } from "./quad-grid";
import { PolarGrid } from "./polar-grid";
import { PoorManPen } from "./poor-man-pen";

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d", { alpha: false });

canvas.width = window.innerWidth * SCALE_FACTOR;
canvas.height = window.innerHeight * SCALE_FACTOR;

const pieceCanvas = document.createElement("canvas");
const pieceCtx = pieceCanvas.getContext("2d");
pieceCanvas.width =
  Math.max(window.innerWidth, window.innerHeight) * SCALE_FACTOR;
pieceCanvas.height = pieceCanvas.width;
pieceCanvas.classList.add("piece");

// document.body.appendChild(pieceCanvas);

/**
 * ToDo:
 * - [*] ресайз CELL_SIZE через dat.gui
 * - [*] курсор-рисовалка
 * - [*] caleido
 * - [*] сохранять настройки в localStorage
 * - [*] добавить прозрачность для кисти
 * - [*] скачивание результта
 * - [*] поправить размеры курсора
 * - [*] вынести логику сетки (создания, вычисления координат на pieceCanvas) в отдельный модуль
 * - [*] абстрагировать логику рисования на pieceCanvas
 * - [*] нормальная кисть (sort of)
 * - [*] квадратная сетка
 * - [*] вынести pieceCanvas из классов сеток чтобы сохранять
 *       его состояние при переключении сетки и удобнее делать пред пункт
 * - [*] рисовать на pieceCanvas не из угла, а из центра
 *       чтобы на границах квадратной (и иногда шестиугольной) сетки избежать артефактов
 * - [*] центральная сетка (когда экран разбит на секторы из центра)
 * - [ ] perf, генерировать для шестиугольной сетки «паттерн» и заливать им холст, как у квадратной
 * - [ ] пофиксить глитчи на стыках сеток
 * - [ ] dry классы сеток и вынести общий код
 * - [ ] сохранять pieceCanvas в ls?
 */

const grids = {
  quad: new QuadGrid(pieceCtx, params.cellSize, params.caleido),
  hex: new HexagonalGrid(pieceCtx, params.cellSize, params.caleido),
  polar: new PolarGrid(
    pieceCtx,
    params.cellSize,
    params.caleido,
    params.polarSections
  )
};

function getGrid() {
  return grids[params.gridType];
}

const pen = new PoorManPen(
  pieceCtx,
  params.penWidth,
  rgba(params.foregroundColor, params.foregroundAlpha)
);
canvas.style.cursor = pen.cursor;

const pointer = Vector.cartesian(0, 0);
function drawLine() {
  requestAnimationFrame(() => {
    pen.draw(getGrid(), pointer);
    forceRender();
  });
}

let shouldRender = true;
function forceRender() {
  shouldRender = true;
}
runWithFps(() => {
  if (!shouldRender) {
    return false;
  }
  shouldRender = false;

  ctx.fillStyle = rgba(params.backgroundColor);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isTooBright(params.backgroundColor)) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  } else {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  }
  if (params.showGrid) {
    getGrid().renderGrid(ctx);
  }
  getGrid().render(ctx);
}, 60);

let inDraw = false;
canvas.addEventListener("mousedown", (e) => {
  inDraw = true;
  pen.startStroke();
  pointer.x = e.pageX;
  pointer.y = e.pageY;
  drawLine();
});
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    e.preventDefault();
    inDraw = true;
    pen.startStroke();
    pointer.x = e.pageX;
    pointer.y = e.pageY;
    drawLine();
  }
});
document.addEventListener("mouseup", () => {
  inDraw = false;
  pen.endStroke();
});
document.addEventListener("touchend", () => {
  inDraw = false;
  pen.endStroke();
});
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

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth * SCALE_FACTOR;
  canvas.height = window.innerHeight * SCALE_FACTOR;
  requestAnimationFrame(() => {
    getGrid().resize();
    forceRender();
  });
});

const nonRerenderParams = ["penWidth", "foregroundColor", "foregroundAlpha"];
onParamChange((param) => {
  if (param === "penWidth") {
    pen.size = params.penWidth;
    canvas.style.cursor = pen.cursor;
  }
  if (param === "foregroundColor" || param === "foregroundAlpha") {
    pen.color = rgba(params.foregroundColor, params.foregroundAlpha);
  }
  if (param === "cellSize") {
    getGrid().cellSize = params.cellSize;
  }
  if (param === "caleido") {
    getGrid().caleido = params.caleido;
  }
  if (param === "gridType") {
    getGrid().resize();
    getGrid().cellSize = params.cellSize;
    getGrid().caleido = params.caleido;
  }
  if (param === "polarSections") {
    grids.polar.sectionsCount = params.polarSections;
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
