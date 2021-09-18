import "./styles.css";

import runWithFps from "run-with-fps";
import { Vector } from "v-for-vector";
import { rgba, downloadCanvas, isTooBright, SCALE_FACTOR } from "./helpers";
import { makeBrushCursor } from "./cursor";
import { params, onParamChange, onErase, onDownload } from "./params";
import { HexagonalGrid } from "./hex-grid";

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
 * - [ ] абстрагировать логику рисования на pieceCanvas
 * - [ ] попробовать реализовать другую сетку (квадратную?)
 * - [ ] центральная сетка (когда экран разбит на секторы из центра)
 */

const brushCursor = makeBrushCursor(canvas);
brushCursor.update(params.penWidth);

const hexGrid = new HexagonalGrid(params.cellSize, params.caleido);

const pointer = Vector.cartesian(0, 0);
function drawLine() {
  const piecePos = hexGrid.translatePosition(pointer);

  if (piecePos) {
    // todo: better line drawing
    // todo: pass abstract drawer into grid to prevent leak of ctx out of class
    hexGrid.pieceCtx.fillStyle = rgba(
      params.foregroundColor,
      params.foregroundAlpha
    );
    hexGrid.pieceCtx.beginPath();
    hexGrid.pieceCtx.arc(
      piecePos.x,
      piecePos.y,
      params.penWidth * SCALE_FACTOR,
      0,
      Math.PI * 2
    );
    hexGrid.pieceCtx.fill();
  }
  forceRender();
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
    hexGrid.renderGrid(ctx);
  }
  hexGrid.render(ctx);
}, 60);

let inDraw = false;
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
    hexGrid.resize();
    forceRender();
  });
});

const nonRerenderParams = ["penWidth", "foregroundColor", "foregroundAlpha"];
onParamChange((param) => {
  if (param === "penWidth") {
    brushCursor.update(params.penWidth);
  }
  if (param === "cellSize") {
    hexGrid.cellSize = params.cellSize;
  }
  if (param === "caleido") {
    hexGrid.caleido = params.caleido;
  }

  if (!nonRerenderParams.includes(param)) {
    forceRender();
  }
});

onErase(() => {
  hexGrid.clean();
  forceRender();
});

onDownload(() => {
  downloadCanvas(canvas, Date.now());
});
