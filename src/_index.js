import "./styles.css";

import runWithFps from "run-with-fps";
import { Hexagon, HexagonSample } from "./grid";
import { Vector } from "v-for-vector";
import * as dat from "dat.gui";

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");

const PIECE_SCALE_FACTOR = 2;
canvas.width = window.innerWidth * PIECE_SCALE_FACTOR;
canvas.height = window.innerHeight * PIECE_SCALE_FACTOR;
canvas.style.positon = "absolute";
canvas.style.width = "100%";
canvas.style.height = "100%";

const isTooBright = (color) => color.reduce((a, b) => a + b, 0) > 340; // ToDo: improve algo (with hsl?)
const params = {
  backgroundColor: [0, 0, 0],
  foregroundColor: "#FFF",
  penWidth: 1,
  showCenters: true,
  erase() {
    pieceCanvas.width = pieceCanvas.width;
    forceRender();
  }
};
const gui = new dat.GUI();
gui.addColor(params, "backgroundColor").onChange(forceRender);
gui.addColor(params, "foregroundColor").onChange(forceRender);
gui.add(params, "penWidth", 0.5, 10, 0.5).onChange(forceRender);
gui.add(params, "showCenters").onChange(forceRender);
gui.add(params, "erase");

const grid2 = [];

const CELL_SIZE = 150;
const sample = new HexagonSample(CELL_SIZE);

function calcGrid() {
  // let y = 0;
  let y = -sample.height;
  // todo: do not prebuild grid it's wasteful and unnecessary
  for (let i = 0; i < 30; i += 1) {
    // let x = 0;
    let x = -sample.width - (i % 2 ? sample.width / 2 : 0);
    for (let j = 0; j < 30; j += 1) {
      grid2.push(Vector.cartesian(x, y));
      x += sample.width;
    }
    y += sample.height - sample.height / 4;
  }
}
calcGrid();
console.log(grid2, sample);

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
pieceCanvas.width =
  Math.max(sample.triangles[0].width, sample.triangles[0].height) *
  PIECE_SCALE_FACTOR;
pieceCanvas.height = pieceCanvas.width;

pieceCanvas.style.position = "fixed";
pieceCanvas.style.right = "0";
pieceCanvas.style.bottom = "0";
pieceCanvas.style.border = "1px solid red";
document.body.appendChild(pieceCanvas);

const hexCanvas = document.createElement("canvas");
const hexCtx = hexCanvas.getContext("2d");
hexCanvas.width = sample.width * PIECE_SCALE_FACTOR;
hexCanvas.height = sample.height * PIECE_SCALE_FACTOR;

function findTriangle(grid, pos) {
  for (const cell of grid) {
    const mouseInCell =
      pos.x >= cell.x &&
      pos.x <= cell.x + sample.width &&
      pos.y >= cell.y &&
      pos.y <= cell.y + sample.height;
    if (mouseInCell) {
      const offsetPosition = pos.clone().sub(cell);
      for (const tri of sample.triangles) {
        if (isInTriangle(offsetPosition, tri)) {
          return [cell.clone(), tri];
        }
      }
    }
  }

  return [null, null];
}

function drawLine() {
  requestAnimationFrame(() => {
    const [targetCell, targetTriangle] = findTriangle(grid2, mouse);

    if (targetTriangle) {
      const local = mouse
        .clone()
        .sub(targetCell)
        .sub(sample.center)
        .mult(PIECE_SCALE_FACTOR);

      local.angle -= targetTriangle.angle - Math.PI / 4;

      // todo: better line drawing
      pieceCtx.fillStyle = params.foregroundColor;
      pieceCtx.beginPath();
      pieceCtx.arc(
        local.x,
        local.y,
        params.penWidth * PIECE_SCALE_FACTOR,
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
  mouse.x = e.pageX;
  mouse.y = e.pageY;
  drawLine();
});
document.addEventListener("mouseup", () => {
  inDraw = false;
});
const mouse = Vector.cartesian(0, 0);
document.addEventListener("mousemove", (e) => {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
  if (!inDraw) {
    return;
  }
  drawLine();
});

runWithFps(() => {
  if (!shouldRender) {
    return false;
  }
  shouldRender = false;
  hexCanvas.width = hexCanvas.width;

  ctx.fillStyle = `rgb(${params.backgroundColor.join(",")})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  sample.triangles.forEach((tri) => {
    hexCtx.save();
    hexCtx.translate(hexCanvas.width / 2, hexCanvas.height / 2);
    hexCtx.rotate(tri.angle - Math.PI / 4 - (Math.PI * 2) / 6);
    hexCtx.drawImage(pieceCanvas, 0, 0);
    hexCtx.restore();
  });

  grid2.forEach((cell) => {
    if (params.showCenters) {
      if (isTooBright(params.backgroundColor)) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      }
      ctx.beginPath();
      ctx.lineWidth = PIECE_SCALE_FACTOR;
      const center = cell.clone().add(sample.center).mult(PIECE_SCALE_FACTOR);
      ctx.arc(center.x, center.y, 5 * PIECE_SCALE_FACTOR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.drawImage(
      hexCanvas,
      cell.x * PIECE_SCALE_FACTOR,
      cell.y * PIECE_SCALE_FACTOR,
      hexCanvas.width,
      hexCanvas.height
    );

    // hex.triangles.forEach((tri) => {

    // })
  });

  // sample.triangles.forEach((tri) => {
  //   ctx.beginPath();
  //   ctx.strokeStyle = "#0cf";
  //   ctx.moveTo(tri.a.x * PIECE_SCALE_FACTOR, tri.a.y * PIECE_SCALE_FACTOR);
  //   ctx.lineTo(tri.b.x * PIECE_SCALE_FACTOR, tri.b.y * PIECE_SCALE_FACTOR);
  //   ctx.lineTo(tri.c.x * PIECE_SCALE_FACTOR, tri.c.y * PIECE_SCALE_FACTOR);
  //   ctx.lineTo(tri.a.x * PIECE_SCALE_FACTOR, tri.a.y * PIECE_SCALE_FACTOR);
  //   ctx.stroke();
  // });
}, 60);
