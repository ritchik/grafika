// camera.ts
import { Vector3, Matrix4 } from './math';

export class Camera {
  position: Vector3;
  target: Vector3;
  up: Vector3;
  
  fov: number;
  aspect: number;
  near: number;
  far: number;
  
  viewMatrix: Matrix4;
  projectionMatrix: Matrix4;
  
  moveSpeed: number = 0.1;
  rotateSpeed: number = 0.02;
  touchRotateSensitivity: number = 0.005;
  touchZoomSensitivity: number = 0.01;
  touchPanSensitivity: number = 0.01;
  
  // Track key states
  keyStates: Record<string, boolean> = {
    'w': false, 's': false, 'a': false, 'd': false,
    'ArrowUp': false, 'ArrowDown': false, 
    'ArrowLeft': false, 'ArrowRight': false,
    '+': false, '-': false, ' ': false
  };

   // Touch state
   private touchState = {
    isTouching: false,
    prevTouchX: 0,
    prevTouchY: 0,
    touchDistance: 0,
    touchType: 'none' as 'none' | 'rotate' | 'zoom' | 'pan'
  };


  
  constructor(fov: number = 60, aspect: number = 1, near: number = 0.1, far: number = 1000) {
    this.position = new Vector3(0, 10, 50);
    this.target = new Vector3(0, 0, 0);
    this.up = new Vector3(0, 1, 0);
    
    this.fov = fov * Math.PI / 180; // Convert to radians
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, this.up);
    this.projectionMatrix = Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
    
    // Set up keyboard controls
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    window.addEventListener('touchstart', this.onTouchStart.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchEnd.bind(this));
  
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.touchState = {
        isTouching: true,
        prevTouchX: e.touches[0].clientX,
        prevTouchY: e.touches[0].clientY,
        touchDistance: 0,
        touchType: 'rotate'
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      this.touchState = {
        isTouching: true,
        prevTouchX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        prevTouchY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        touchDistance: distance,
        touchType: distance > 50 ? 'zoom' : 'pan'
      };
    }
    e.preventDefault();
  }
  

  private onTouchMove(e: TouchEvent): void {
    if (!this.touchState.isTouching) return;
    
    if (e.touches.length === 1 && this.touchState.touchType === 'rotate') {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchState.prevTouchX;
      const deltaY = touch.clientY - this.touchState.prevTouchY;
      
      // Horizontal rotation (y-axis)
      const targetOffset = Vector3.subtract(this.target, this.position);
      const rotationY = Matrix4.rotationY(-deltaX * this.touchRotateSensitivity);
      const rotatedOffsetY = rotationY.transformPoint(targetOffset);
      
      // Vertical rotation (x-axis)
      const forward = Vector3.normalize(rotatedOffsetY);
      const right = Vector3.normalize(Vector3.cross(forward, this.up));
      
      // Use the Rodriguez rotation formula directly instead of Matrix4.rotationAxis
      const angle = -deltaY * this.touchRotateSensitivity;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      const rotatedOffset = new Vector3(
        rotatedOffsetY.x * cosA + (right.y * rotatedOffsetY.z - right.z * rotatedOffsetY.y) * sinA + 
          right.x * Vector3.dot(right, rotatedOffsetY) * (1 - cosA),
        rotatedOffsetY.y * cosA + (right.z * rotatedOffsetY.x - right.x * rotatedOffsetY.z) * sinA + 
          right.y * Vector3.dot(right, rotatedOffsetY) * (1 - cosA),
        rotatedOffsetY.z * cosA + (right.x * rotatedOffsetY.y - right.y * rotatedOffsetY.x) * sinA + 
          right.z * Vector3.dot(right, rotatedOffsetY) * (1 - cosA)
      );
      
      this.target.x = this.position.x + rotatedOffset.x;
      this.target.y = this.position.y + rotatedOffset.y;
      this.target.z = this.position.z + rotatedOffset.z;
      
      this.touchState.prevTouchX = touch.clientX;
      this.touchState.prevTouchY = touch.clientY;
    } 
    else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      if (this.touchState.touchType === 'zoom') {
        // Zoom with pinch gesture
        const delta = distance - this.touchState.touchDistance;
        this.fov -= delta * this.touchZoomSensitivity;
        this.fov = Math.max(0.1, Math.min(Math.PI - 0.1, this.fov));
        this.projectionMatrix = Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
      } 
      else if (this.touchState.touchType === 'pan') {
        // Pan with two-finger drag
        const deltaX = currentMidX - this.touchState.prevTouchX;
        const deltaY = currentMidY - this.touchState.prevTouchY;
        
        const forward = Vector3.normalize(Vector3.subtract(this.target, this.position));
        const right = Vector3.normalize(Vector3.cross(forward, this.up));
        const up = Vector3.normalize(Vector3.cross(right, forward));
        
        const moveRight = Vector3.scale(right, -deltaX * this.touchPanSensitivity);
        const moveUp = Vector3.scale(up, deltaY * this.touchPanSensitivity);
        
        this.position.add(moveRight);
        this.position.add(moveUp);
        this.target.add(moveRight);
        this.target.add(moveUp);
      }
      
      this.touchState.prevTouchX = currentMidX;
      this.touchState.prevTouchY = currentMidY;
      this.touchState.touchDistance = distance;
    }
    
    e.preventDefault();
  }
  
  private onTouchEnd(e: TouchEvent): void {
    this.touchState.isTouching = false;
    this.touchState.touchType = 'none';
    e.preventDefault();
  }


  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key in this.keyStates) {
      this.keyStates[event.key] = true;
      event.preventDefault();
    }
  }
  
  onKeyUp(event: KeyboardEvent): void {
    if (event.key in this.keyStates) {
      this.keyStates[event.key] = false;
      event.preventDefault();
    }
  }
  
  update(): void {
    // Direction vectors
    const forward = Vector3.subtract(this.target, this.position);
    forward.normalize();
    
    const right = Vector3.cross(forward, this.up);
    right.normalize();
    
    // Movement
    if (this.keyStates['w']) {
      const movement = Vector3.scale(forward, this.moveSpeed);
      this.position.add(movement);
      this.target.add(movement);
    }
    if (this.keyStates['s']) {
      const movement = Vector3.scale(forward, -this.moveSpeed);
      this.position.add(movement);
      this.target.add(movement);
    }
    if (this.keyStates['a']) {
      const movement = Vector3.scale(right, -this.moveSpeed);
      this.position.add(movement);
      this.target.add(movement);
    }
    if (this.keyStates['d']) {
      const movement = Vector3.scale(right, this.moveSpeed);
      this.position.add(movement);
      this.target.add(movement);
    }
    if (this.keyStates[' ']) {
      const movement = Vector3.scale(this.up, this.moveSpeed);
      this.position.add(movement);
      this.target.add(movement);
    }
    
    // Rotation
    if (this.keyStates['ArrowLeft']) {
      // Rotate camera left around y-axis
      const targetOffset = Vector3.subtract(this.target, this.position);
      const rotationMatrix = Matrix4.rotationY(this.rotateSpeed);
      const rotatedOffset = rotationMatrix.transformPoint(targetOffset);
      this.target.x = this.position.x + rotatedOffset.x;
      this.target.y = this.position.y + rotatedOffset.y;
      this.target.z = this.position.z + rotatedOffset.z;
    }
    if (this.keyStates['ArrowRight']) {
      // Rotate camera right around y-axis
      const targetOffset = Vector3.subtract(this.target, this.position);
      const rotationMatrix = Matrix4.rotationY(-this.rotateSpeed);
      const rotatedOffset = rotationMatrix.transformPoint(targetOffset);
      this.target.x = this.position.x + rotatedOffset.x;
      this.target.y = this.position.y + rotatedOffset.y;
      this.target.z = this.position.z + rotatedOffset.z;
    }
    if (this.keyStates['ArrowUp']) {
      // Rotate camera up around local x-axis
      const targetOffset = Vector3.subtract(this.target, this.position);
      
      // Create local x-axis (right vector)
      const forward = Vector3.normalize(targetOffset);
      const right = Vector3.normalize(Vector3.cross(forward, this.up));
      const rotationAxis = right;
      
      // Create rotation matrix around the local x-axis
      const cosA = Math.cos(this.rotateSpeed);
      const sinA = Math.sin(this.rotateSpeed);
      
      // Apply rotation using Rodriguez rotation formula
      const rotatedOffset = new Vector3(
        targetOffset.x * cosA + (rotationAxis.y * targetOffset.z - rotationAxis.z * targetOffset.y) * sinA + 
          rotationAxis.x * Vector3.dot(rotationAxis, targetOffset) * (1 - cosA),
        targetOffset.y * cosA + (rotationAxis.z * targetOffset.x - rotationAxis.x * targetOffset.z) * sinA + 
          rotationAxis.y * Vector3.dot(rotationAxis, targetOffset) * (1 - cosA),
        targetOffset.z * cosA + (rotationAxis.x * targetOffset.y - rotationAxis.y * targetOffset.x) * sinA + 
          rotationAxis.z * Vector3.dot(rotationAxis, targetOffset) * (1 - cosA)
      );
      
      this.target.x = this.position.x + rotatedOffset.x;
      this.target.y = this.position.y + rotatedOffset.y;
      this.target.z = this.position.z + rotatedOffset.z;
    }
    if (this.keyStates['ArrowDown']) {
      // Rotate camera down around local x-axis
      const targetOffset = Vector3.subtract(this.target, this.position);
      
      // Create local x-axis (right vector)
      const forward = Vector3.normalize(targetOffset);
      const right = Vector3.normalize(Vector3.cross(forward, this.up));
      const rotationAxis = right;
      
      // Create rotation matrix around the local x-axis
      const cosA = Math.cos(-this.rotateSpeed);
      const sinA = Math.sin(-this.rotateSpeed);
      
      // Apply rotation using Rodriguez rotation formula
      const rotatedOffset = new Vector3(
        targetOffset.x * cosA + (rotationAxis.y * targetOffset.z - rotationAxis.z * targetOffset.y) * sinA + 
          rotationAxis.x * Vector3.dot(rotationAxis, targetOffset) * (1 - cosA),
        targetOffset.y * cosA + (rotationAxis.z * targetOffset.x - rotationAxis.x * targetOffset.z) * sinA + 
          rotationAxis.y * Vector3.dot(rotationAxis, targetOffset) * (1 - cosA),
        targetOffset.z * cosA + (rotationAxis.x * targetOffset.y - rotationAxis.y * targetOffset.x) * sinA + 
          rotationAxis.z * Vector3.dot(rotationAxis, targetOffset) * (1 - cosA)
      );
      
      this.target.x = this.position.x + rotatedOffset.x;
      this.target.y = this.position.y + rotatedOffset.y;
      this.target.z = this.position.z + rotatedOffset.z;
    }
    
    // Zoom (adjust FOV)
    if (this.keyStates['+']) {
      this.fov -= 0.01;
      if (this.fov < 0.1) this.fov = 0.1;
      this.projectionMatrix = Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
    }
    if (this.keyStates['-']) {
      this.fov += 0.01;
      if (this.fov > Math.PI - 0.1) this.fov = Math.PI - 0.1;
      this.projectionMatrix = Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
    }
    
    // Update view matrix
    this.viewMatrix = Matrix4.lookAt(this.position, this.target, this.up);
  }
  
  updateAspect(aspect: number): void {
    this.aspect = aspect;
    this.projectionMatrix = Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
  }
  
  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    window.removeEventListener('touchstart', this.onTouchStart.bind(this));
    window.removeEventListener('touchmove', this.onTouchMove.bind(this));
    window.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }
}