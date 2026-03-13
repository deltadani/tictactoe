export class OrbitControls {
  constructor() {
    this.update = () => {};
    this.target = { set: () => {} };
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.minDistance = 3;
    this.maxDistance = 10;
  }
}
