export class MeshStandardMaterial {
  clone() { return new MeshStandardMaterial(); }
}
export class MeshPhongMaterial {
  emissive = { setHex: () => {} };
}
export class WebGLRenderer {
  domElement = document.createElement('canvas');
  shadowMap = { enabled: false };
  setSize() {}
  setClearColor() {}
  render() {}
  dispose() {}
}
export class PerspectiveCamera {
  position = { set: () => {} };
  lookAt() {}
  updateProjectionMatrix() {}
}
export class BoxGeometry {}
export class Mesh {
  position = { set: () => {}, x: 0, y: 0, z: 0 };
  scale = { set: () => {} };
  material = new MeshStandardMaterial();
  userData = {};
}
export class Scene {
  background = null;
  children = [];
  add() {}
}
export class Color {
  setHex() {}
}
export class AmbientLight {}
export class DirectionalLight {
  position = { set: () => {} };
}
export class Raycaster {
  setFromCamera() {}
  intersectObjects() { return []; }
}
export class Vector2 {
  x = 0;
  y = 0;
}
export class Vector3 {
  set() {}
}
