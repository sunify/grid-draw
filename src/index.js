import "./styles.css";

import runWithFps from "run-with-fps";
import { Hexagon } from "./grid";
import { Vector } from "v-for-vector";

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const grid = [];

const lerp = (n1, n2, t) => n1 + (n2 - n1) * t;

const CELL_SIZE = 300;
const sample = new Hexagon(0, 0, CELL_SIZE);
let y = -sample.height;
for (let i = 0; i < Math.ceil(canvas.height / CELL_SIZE) + 5; i += 1) {
  let x = -sample.width - (i % 2 ? sample.width / 2 : 0);
  for (let j = 0; j < Math.ceil(canvas.width / CELL_SIZE) + 5; j += 1) {
    // const shiftY = j % 2 ? sample.verticalShiftSize : 0;
    grid.push(new Hexagon(x, y, CELL_SIZE));
    x += sample.width;
  }
  y += sample.height - sample.height / 4;
}

const mouse = Vector.cartesian(0, 0);
document.addEventListener("mousemove", (e) => {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
});

function sign(a, b, c) {
  return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
}

function PointInTriangle(p, a, b, c) {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);

  const has_neg = d1 < 0 || d2 < 0 || d3 < 0;
  const has_pos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(has_neg && has_pos);
}

function getCentroid(tri) {
  return Vector.cartesian(
    [tri.a.x, tri.b.x, tri.c.x].reduce((a, b) => a + b, 0) / 3,
    [tri.a.y, tri.b.y, tri.c.y].reduce((a, b) => a + b, 0) / 3
  );
}

const pieceCanvas = document.createElement("canvas");
const pieceCtx = pieceCanvas.getContext("2d");
pieceCanvas.width =
  Math.max(sample.triangles[0].width, sample.triangles[0].height) * 2;
pieceCanvas.height = pieceCanvas.width;

const hexCanvas = document.createElement("canvas");
const hexCtx = hexCanvas.getContext("2d");
hexCanvas.width = sample.width * 2;
hexCanvas.height = sample.height * 2;
document.body.appendChild(pieceCanvas);
pieceCanvas.style.position = "fixed";
pieceCanvas.style.right = 0;
pieceCanvas.style.bottom = 0;
pieceCanvas.style.border = "1px solid #FFF";
pieceCanvas.style.background = "rgba(255, 255, 0, 0.3)";

runWithFps(() => {
  const highlightedHexagons = grid.filter((hex) => {
    const [x1, y1, x2, y2] = hex.boundingBox;
    return mouse.x >= x1 && mouse.x <= x2 && mouse.y >= y1 && mouse.y <= y2;
  });
  let highlightedHexagon;
  let highlightedTriangle;

  highlightedHexagons.forEach((hex) => {
    if (!highlightedTriangle) {
      highlightedTriangle = hex.triangles.find((tri) =>
        PointInTriangle(mouse, tri.a, tri.b, tri.c)
      );
      if (highlightedTriangle) {
        highlightedHexagon = hex;
      }
    }
  });

  pieceCanvas.width = pieceCanvas.width;
  hexCanvas.width = hexCanvas.width;
  canvas.width = canvas.width;

  pieceCtx.fillStyle = "rgba(255, 255, 0, 0.2)";
  pieceCtx.strokeStyle = "#fff";
  // pieceCtx.fillRect(0, 0, pieceCanvas.width, pieceCanvas.height);
  pieceCtx.lineWidth = 4;
  pieceCtx.beginPath();
  pieceCtx.moveTo(0, 0);
  pieceCtx.lineTo(20, 20);
  pieceCtx.stroke();

  if (highlightedTriangle) {
    const angle = Math.atan2(
      highlightedHexagon.center.y - mouse.y,
      highlightedHexagon.center.x - mouse.x
    );
    const dist = Vector.dist(mouse, highlightedHexagon.center);
    const local = Vector.polar(angle, dist);
    

    pieceCtx.fillStyle = "#FFF";
    pieceCtx.beginPath();
    pieceCtx.arc(local.x * 2, local.y * 2, 4, 0, Math.PI * 2);
    pieceCtx.fill();

    ctx.strokeStyle = "#FFF";
    ctx.beginPath();
    ctx.arc(
      highlightedHexagon.center.x,
      highlightedHexagon.center.y,
      7,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  sample.triangles.forEach((tri) => {
    hexCtx.save();
    hexCtx.translate(hexCanvas.width / 2, hexCanvas.height / 2);
    hexCtx.rotate(tri.angle - Math.PI / 4 - (Math.PI * 2) / 6);
    hexCtx.drawImage(pieceCanvas, 0, 0);
    hexCtx.restore();
  });

  grid.forEach((hex) => {
    hex.triangles.forEach((tri, i) => {
      ctx.fillStyle = `hsl(${i}00, 50%, 50%)`;
      ctx.strokeStyle = ctx.fillStyle;

      ctx.beginPath();
      ctx.moveTo(tri.a.x, tri.a.y);
      ctx.lineTo(tri.b.x, tri.b.y);
      ctx.lineTo(tri.c.x, tri.c.y);
      ctx.lineTo(tri.a.x, tri.a.y);

      if (tri === highlightedTriangle) {
        ctx.stroke();
      }

      const c = getCentroid(tri);
      ctx.fillText(i, c.x, c.y);
    });

    ctx.drawImage(
      hexCanvas,
      hex.boundingBox[0],
      hex.boundingBox[1],
      hexCanvas.width / 2,
      hexCanvas.height / 2
    );
  });
}, 10);
