// index.ts
import { Camera } from './camera';
import { Scene } from './scene';
import { Renderer } from './render';

class Application {
  private camera: Camera;
  private scene: Scene;
  private renderer: Renderer;
  private isRunning: boolean = false;
  
  constructor() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    
    // Initialize components
    this.camera = new Camera(60, window.innerWidth / window.innerHeight);
    this.scene = new Scene();
    this.renderer = new Renderer('canvas');
    
    // Add instructions
    this.createInstructions();
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.updateAspect(window.innerWidth / window.innerHeight);
    });
  }
  
  private createInstructions(): void {
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.left = '10px';
    instructions.style.color = 'white';
    instructions.style.fontFamily = 'monospace';
    instructions.innerHTML = `
      <h3>Virtual Camera Controls:</h3>
      <p>WASD - Move camera</p>
      <p>Arrow keys - Rotate camera</p>
      <p>Space - Move up</p>
      <p>+ / - - Zoom in/out</p>
      <p>T - Toggle transparency mode</p>
    `;
    document.body.appendChild(instructions);
  }
  
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }
  
  private animate = (): void => {
    if (!this.isRunning) return;
    
    // Update
    this.camera.update();
    this.scene.update();
    
    // Render
    this.renderer.render(this.camera, this.scene.cubes);
    
    // Request next frame
    requestAnimationFrame(this.animate);
  }
  
  stop(): void {
    this.isRunning = false;
    this.camera.dispose();
  }
}

// Create and start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.start();
});