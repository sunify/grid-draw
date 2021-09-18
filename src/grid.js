import { Vector } from "v-for-vector";

export class Triangle {
  constructor(x, y, angle, angleSize, len) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.angleSize = angleSize;
    this.len = len;
  }

  set len(len) {
    this._len = len;
    const center = Vector.cartesian(this.x + len, this.y + len);
    const a = Vector.cartesian(len + this.x, len + this.y);
    const b = Vector.polar(this.angle - this.angleSize / 2, len).add(center);
    const c = Vector.polar(this.angle + this.angleSize / 2, len).add(center);
    this.a = a;
    this.b = b;
    this.c = c;

    this.boundingBox = this._getBoundingBox();
  }

  get len() {
    return this._len;
  }

  get width() {
    return this.boundingBox[2] - this.boundingBox[0];
  }

  get height() {
    return this.boundingBox[3] - this.boundingBox[1];
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
  }

  set size(size) {
    this._size = size;

    if (this.triangles.length) {
      this.triangles.forEach((t) => {
        t.len = size / 2;
      });
    } else {
      const angleStep = (Math.PI * 2) / 6;
      for (let i = 0; i < 6; i += 1) {
        this.triangles.push(
          new Triangle(
            this.x,
            this.y,
            angleStep * i + Math.PI,
            angleStep,
            size / 2
          )
        );
      }
    }

    this.boundingBox = this._getBoundingBox();
    this.center = Vector.cartesian(
      this.left + this.width / 2,
      this.top + this.height / 2
    );
  }

  get size() {
    return this._size;
  }

  get left() {
    return this.boundingBox[0];
  }

  get top() {
    return this.boundingBox[1];
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
    return this.width / 4;
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

export class HexagonSample {
  constructor(size) {
    this.size = size;
  }

  _updateTriangles() {
    this.triangles = [];

    const angleStep = (Math.PI * 2) / 6;
    const halfSize = this.size / 2;
    for (let i = 0; i < 6; i += 1) {
      this.triangles.push(
        new Triangle(0, 0, angleStep * i + Math.PI, angleStep, halfSize)
      );
    }
    const xx = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([x1, , x2]) => [x1, x2])
      .reduce((a, b) => [...a, ...b], []);
    const left = Math.min(...xx);

    const yy = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([, y1, , y2]) => [y1, y2])
      .reduce((a, b) => [...a, ...b], []);
    const top = Math.min(...yy);
    const offset = Vector.cartesian(left, top);
    this.triangles.forEach((t) => {
      t.a.sub(offset);
      t.b.sub(offset);
      t.c.sub(offset);
    });
  }

  get size() {
    return this._size;
  }

  set size(size) {
    this._size = size;
    this._updateTriangles();
    this.sizeV = Vector.cartesian(this.width, this.height);
    this.half = this.sizeV.clone().div(2);
    this.pos = Vector.cartesian(this.left, this.top);
    this.center = this.sizeV.clone().div(2).add(this.pos);
  }

  get left() {
    const xx = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([x1, , x2]) => [x1, x2])
      .reduce((a, b) => [...a, ...b], []);
    return Math.min(...xx);
  }

  get top() {
    const yy = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([, y1, , y2]) => [y1, y2])
      .reduce((a, b) => [...a, ...b], []);
    return Math.min(...yy);
  }

  get width() {
    const xx = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([x1, , x2]) => [x1, x2])
      .reduce((a, b) => [...a, ...b], []);
    return Math.max(...xx) - Math.min(...xx);
  }

  get height() {
    const yy = this.triangles
      .map((tri) => tri.boundingBox)
      .map(([, y1, , y2]) => [y1, y2])
      .reduce((a, b) => [...a, ...b], []);
    return Math.max(...yy) - Math.min(...yy);
  }

  get verticalShiftSize() {
    return this.height / 2;
  }

  get horizontalShiftSize() {
    return this.width / 4;
  }
}
