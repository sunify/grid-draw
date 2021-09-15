import { Vector } from "v-for-vector";

export class Triangle {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;

    this.boundingBox = this._getBoundingBox();
  }

  _getBoundingBox() {
    const xx = [this.a.x, this.b.x, this.c.x];
    const yy = [this.a.y, this.b.y, this.c.y];

    return [Math.min(...xx), Math.min(...yy), Math.max(...xx), Math.max(...yy)];
  }
}

export class Hexagon {
  constructor(x, y, size) {
    this.triangles = [];
    this.x = x;
    this.y = y;
    this.size = size;

    const angleStep = (Math.PI * 2) / 6;
    const halfSize = size / 2;
    this.center = Vector.cartesian(x + halfSize, y + halfSize);
    for (let i = 0; i < 6; i += 1) {
      const startAngle = angleStep * i;
      const endAngle = startAngle + angleStep;
      const a = Vector.cartesian(halfSize + x, halfSize + y);
      const b = Vector.polar(startAngle, halfSize).add(this.center);
      const c = Vector.polar(endAngle, halfSize).add(this.center);

      this.triangles.push(new Triangle(a, b, c));
    }

    this.boundingBox = this._getBoundingBox();
  }

  get width() {
    return this.boundingBox[2] - this.boundingBox[0];
  }

  get height() {
    return this.boundingBox[3] - this.boundingBox[1];
  }

  get verticalShiftSize() {
    return this.height / 2;
  }

  get horizontalShiftSize() {
    return this.size / 4;
  }

  _getBoundingBox() {
    const xx = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([x1, , x2]) => [x1, x2])
      .reduce((a, b) => [...a, ...b], []);
    const yy = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([, y1, , y2]) => [y1, y2])
      .reduce((a, b) => [...a, ...b], []);

    return [Math.min(...xx), Math.min(...yy), Math.max(...xx), Math.max(...yy)];
  }
}
