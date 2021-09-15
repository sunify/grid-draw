import "./styles.css";

import runWithFps from "run-with-fps";
import { Hexagon } from "./grid";

const canvas = document.getElementById("app");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const grid = [];

const CELL_SIZE = 200;
const sample = new Hexagon(0, 0, CELL_SIZE);
let y = -sample.height;
for (let i = 0; i < Math.ceil(canvas.height / CELL_SIZE) + 5; i += 1) {
  let x = -sample.width;
  for (let j = 0; j < Math.ceil(canvas.width / CELL_SIZE) + 5; j += 1) {
    const shiftY = j % 2 ? sample.verticalShiftSize : 0;
    grid.push(new Hexagon(x, y + shiftY, CELL_SIZE));
    x += sample.width - sample.horizontalShiftSize;
  }
  y += sample.height;
}

runWithFps(() => {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  grid.forEach((hex) => {
    hex.triangles.forEach((tri, i) => {
      ctx.fillStyle = `hsl(${i}00, 50%, 50%)`;
      ctx.strokeStyle = ctx.fillStyle;

      ctx.beginPath();
      ctx.moveTo(tri.a.x, tri.a.y);
      ctx.lineTo(tri.b.x, tri.b.y);
      ctx.lineTo(tri.c.x, tri.c.y);
      ctx.stroke();
    });
  });
}, 1);
