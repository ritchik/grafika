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
    // Create 2 cubes with different colors and positions
    const colors = [
      Color.fromHex(0xff0000), // Red
      Color.fromHex(0x00ff00)  // Green
    ];
    
    // Create first cube (red)
    const cube1 = new Cube(new Vector3(-0.5, 0, 0), colors[0]);
    cube1.scale = new Vector3(40, 1, 20); // Make it 40x1x20
    this.cubes.push(cube1);
    
    // Create second cube (green) - positioned 1 unit away from the first cube
    const cube2 = new Cube(new Vector3(0.5, 2, 0), colors[1]);
    cube2.scale = new Vector3(40, 1, 20); // Make it 40x1x20
    this.cubes.push(cube2);
  }
  
  toggleTransparency(): void {
    this.transparentMode = !this.transparentMode;
    
    for (const cube of this.cubes) {
      cube.setTransparent(this.transparentMode);
    }
  }
  
  update(): void {
    // Update cubes without rotation
    for (const cube of this.cubes) {
      cube.update();
    }
  }
}