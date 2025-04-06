// scene.ts
import { Vector3, Color } from './math';
import { Cube } from './cube';
import { Camera } from './camera';

export class Scene {
  cubes: Cube[] = [];
  transparentMode: boolean = false;
  
  constructor() {
    this.initCubes();
    
    // Listen for 'T' key to toggle transparency
    window.addEventListener('keydown', (e) => {
      if (e.key === 't' || e.key === 'T') {
        this.toggleTransparency();
      }
    });
  }
  
  private initCubes(): void {
    // Create 4 cubes with different colors and positions
    const colors = [
      Color.fromHex(0xff0000), // Red
      Color.fromHex(0x00ff00), // Green
      Color.fromHex(0x0000ff), // Blue
      Color.fromHex(0xffff00)  // Yellow
    ];
    
    const positions = [
      new Vector3(-2, 0, 0),
      new Vector3(2, 0, 0),
      new Vector3(0, 0, -2),
      new Vector3(0, 0, 2)
    ];
    
    for (let i = 0; i < 4; i++) {
      const cube = new Cube(positions[i], colors[i]);
      this.cubes.push(cube);
    }
  }
  
  toggleTransparency(): void {
    this.transparentMode = !this.transparentMode;
    
    for (const cube of this.cubes) {
      cube.setTransparent(this.transparentMode);
    }
  }
  
  update(): void {
    // Animate cubes - rotate them
    for (const cube of this.cubes) {
      cube.update();
    }
  }
}