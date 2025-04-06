// renderer.ts
import { Vector3, Matrix4, Color } from './math';
import { Camera } from './camera';
import { Cube, Face } from './cube';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = 0; // Initialize with default values
    this.height = 0;
    this.resize();
    
    // Handle window resize
    window.addEventListener('resize', () => this.resize());
  }
  
  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  clear(): void {
    this.ctx.fillStyle = '#111111';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  render(camera: Camera, cubes: Cube[]): void {
    this.clear();
    
    // Project all cubes and calculate their distances
    const cubeFaces: {face: Face, distance: number, cube: Cube}[] = [];
    
    for (const cube of cubes) {
      // Get transformed faces
      const faces = cube.getTransformedFaces();
      
      for (const face of faces) {
        // Calculate distance from camera to face center
        const distance = Vector3.distance(camera.position, face.center);
        
        // Check if the face is facing away from the camera
        const cameraToFace = Vector3.subtract(face.center, camera.position);
        const dotProduct = Vector3.dot(face.normal, cameraToFace);
        
        // For transparent cubes, render all faces
        // For non-transparent, only render faces facing the camera (dotProduct < 0)
        if (cube.isTransparentMode() || dotProduct < 0) {
          cubeFaces.push({ face, distance, cube });
        }
      }
    }
    
    // Sort faces by distance (farthest first for painter's algorithm)
    cubeFaces.sort((a, b) => b.distance - a.distance);
    
    // Draw faces in order (farthest to nearest)
    for (const { face, cube } of cubeFaces) {
      this.drawFace(face, camera, cube.isTransparentMode());
    }
  }
  
  private drawFace(face: Face, camera: Camera, isTransparent: boolean): void {
    const { vertices, color } = face;
    
    // Convert 3D vertices to 2D screen coordinates
    const screenPoints: {x: number, y: number}[] = [];
    
    for (const vertex of vertices) {
      // Project vertex through camera view and projection matrices
      const viewSpaceVertex = camera.viewMatrix.transformPoint(vertex);
      const clipSpaceVertex = camera.projectionMatrix.transformPoint(viewSpaceVertex);
      
      // Convert clip space to screen space
      const screenX = (clipSpaceVertex.x + 1) * this.width / 2;
      const screenY = (-clipSpaceVertex.y + 1) * this.height / 2;
      
      screenPoints.push({ x: screenX, y: screenY });
    }
    
    // Draw face as polygon
    this.ctx.beginPath();
    this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    
    for (let i = 1; i < screenPoints.length; i++) {
      this.ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
    }
    
    this.ctx.closePath();
    
    // Fill face with color
    this.ctx.fillStyle = color.toRGBA();
    this.ctx.fill();
    
    // Draw outline for clarity
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
}