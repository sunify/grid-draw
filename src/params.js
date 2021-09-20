import * as dat from "dat.gui";

const LS_KEY = "dat.gui.params.1";

function saveParams() {
  localStorage.setItem(LS_KEY, JSON.stringify(params));
}

function loadParams() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY));
  } catch {
    return {};
  }
}

const _changeCallbacks = [];
const _eraseCallbacks = [];
const _downloadCallbacks = [];

function fireCallbacks(callbacks, ...params) {
  callbacks.forEach((cb) => cb(...params));
}

export function onParamChange(cb) {
  _changeCallbacks.push(cb);
}

export function onErase(cb) {
  _eraseCallbacks.push(cb);
}

export function onDownload(cb) {
  _downloadCallbacks.push(cb);
}

function handleParamChange(param, value) {
  saveParams();
  fireCallbacks(_changeCallbacks, param, value);
}

export const params = {
  backgroundColor: [0, 0, 0],
  foregroundColor: [255, 255, 255],
  foregroundAlpha: 1,
  penWidth: 1,
  cellSize: 200,
  caleido: false,
  showGrid: true,
  gridType: "hex",
  polarSections: 12,
  erase() {
    fireCallbacks(_eraseCallbacks);
  },
  download() {
    fireCallbacks(_downloadCallbacks);
  },
  ...loadParams()
};

const gui = new dat.GUI();
gui
  .addColor(params, "backgroundColor")
  .onChange((value) => handleParamChange("backgroundColor", value));
gui
  .addColor(params, "foregroundColor")
  .onChange((value) => handleParamChange("foregroundColor", value));
gui
  .add(params, "foregroundAlpha", 0, 1, 0.05)
  .onChange((value) => handleParamChange("foregroundAlpha", value));
gui
  .add(params, "penWidth", 0.5, 10, 0.5)
  .onChange((value) => handleParamChange("penWidth", value));
gui
  .add(params, "cellSize", 50, 500, 10)
  .onChange((value) => handleParamChange("cellSize", value));
gui
  .add(params, "polarSections", 2, 20, 2)
  .onChange((value) => handleParamChange("polarSections", value));
gui
  .add(params, "showGrid")
  .onChange((value) => handleParamChange("showGrid", value));
gui
  .add(params, "caleido")
  .onChange((value) => handleParamChange("caleido", value));
gui
  .add(params, "gridType", {
    Hexagon: "hex",
    Square: "quad",
    Polar: "polar"
  })
  .onChange((value) => handleParamChange("gridType", value));
gui.add(params, "erase");
gui.add(params, "download");
