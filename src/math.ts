// math.ts
export class Vector3 {
    constructor(public x: number, public y: number, public z: number) {}
  
    static add(v1: Vector3, v2: Vector3): Vector3 {
      return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }
  
    static subtract(v1: Vector3, v2: Vector3): Vector3 {
      return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }
  
    static scale(v: Vector3, scalar: number): Vector3 {
      return new Vector3(v.x * scalar, v.y * scalar, v.z * scalar);
    }
  
    static dot(v1: Vector3, v2: Vector3): number {
      return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }
  
    static cross(v1: Vector3, v2: Vector3): Vector3 {
      return new Vector3(
        v1.y * v2.z - v1.z * v2.y,
        v1.z * v2.x - v1.x * v2.z,
        v1.x * v2.y - v1.y * v2.x
      );
    }
  
    static normalize(v: Vector3): Vector3 {
      const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      if (length === 0) return new Vector3(0, 0, 0);
      return new Vector3(v.x / length, v.y / length, v.z / length);
    }
  
    static distance(v1: Vector3, v2: Vector3): number {
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const dz = v2.z - v1.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  
    clone(): Vector3 {
      return new Vector3(this.x, this.y, this.z);
    }
  
    add(v: Vector3): void {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
    }
  
    subtract(v: Vector3): void {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
    }
  
    scale(scalar: number): void {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
    }
  
    normalize(): void {
      const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      if (length === 0) return;
      this.x /= length;
      this.y /= length;
      this.z /= length;
    }
  }
  
 

  
  export class Matrix4 {
    public data: number[];


    // Add this method to your Matrix4 class in math.ts
/**
 * Creates a rotation matrix around an arbitrary axis
 * @param axis The axis to rotate around (should be normalized)
 * @param angle The angle to rotate in radians
 * @returns A new Matrix4 representing the rotation
 */
static rotationAxis(axis: Vector3, angle: number): Matrix4 {
    const m = new Matrix4();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;
    const x = axis.x;
    const y = axis.y;
    const z = axis.z;
    
    // Ensure the axis is normalized
    const length = Math.sqrt(x * x + y * y + z * z);
    if (Math.abs(length - 1) > 0.0001) {
      const invLength = 1 / length;
      const normalizedX = x * invLength;
      const normalizedY = y * invLength;
      const normalizedZ = z * invLength;
      
      // Use normalized values
      m.data[0] = t * normalizedX * normalizedX + c;
      m.data[1] = t * normalizedX * normalizedY + s * normalizedZ;
      m.data[2] = t * normalizedX * normalizedZ - s * normalizedY;
      m.data[3] = 0;
      
      m.data[4] = t * normalizedX * normalizedY - s * normalizedZ;
      m.data[5] = t * normalizedY * normalizedY + c;
      m.data[6] = t * normalizedY * normalizedZ + s * normalizedX;
      m.data[7] = 0;
      
      m.data[8] = t * normalizedX * normalizedZ + s * normalizedY;
      m.data[9] = t * normalizedY * normalizedZ - s * normalizedX;
      m.data[10] = t * normalizedZ * normalizedZ + c;
      m.data[11] = 0;
      
      m.data[12] = 0;
      m.data[13] = 0;
      m.data[14] = 0;
      m.data[15] = 1;
    } else {
      // Axis is already normalized
      m.data[0] = t * x * x + c;
      m.data[1] = t * x * y + s * z;
      m.data[2] = t * x * z - s * y;
      m.data[3] = 0;
      
      m.data[4] = t * x * y - s * z;
      m.data[5] = t * y * y + c;
      m.data[6] = t * y * z + s * x;
      m.data[7] = 0;
      
      m.data[8] = t * x * z + s * y;
      m.data[9] = t * y * z - s * x;
      m.data[10] = t * z * z + c;
      m.data[11] = 0;
      
      m.data[12] = 0;
      m.data[13] = 0;
      m.data[14] = 0;
      m.data[15] = 1;
    }
    
    return m;
  }


  
    constructor() {
      // Create identity matrix by default
      this.data = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
    }
  
    static multiply(m1: Matrix4, m2: Matrix4): Matrix4 {
      const result = new Matrix4();
      const a = m1.data;
      const b = m2.data;
      const res = result.data;
  
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          res[i * 4 + j] = 
            a[i * 4 + 0] * b[0 * 4 + j] +
            a[i * 4 + 1] * b[1 * 4 + j] +
            a[i * 4 + 2] * b[2 * 4 + j] +
            a[i * 4 + 3] * b[3 * 4 + j];
        }
      }
  
      return result;
    }
  
    static translation(x: number, y: number, z: number): Matrix4 {
      const m = new Matrix4();
      m.data[12] = x;
      m.data[13] = y;
      m.data[14] = z;
      return m;
    }
  
    static rotationX(angle: number): Matrix4 {
      const m = new Matrix4();
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      
      m.data[5] = c;
      m.data[6] = s;
      m.data[9] = -s;
      m.data[10] = c;
      
      return m;
    }
  
    static rotationY(angle: number): Matrix4 {
      const m = new Matrix4();
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      
      m.data[0] = c;
      m.data[2] = -s;
      m.data[8] = s;
      m.data[10] = c;
      
      return m;
    }
  
    static rotationZ(angle: number): Matrix4 {
      const m = new Matrix4();
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      
      m.data[0] = c;
      m.data[1] = s;
      m.data[4] = -s;
      m.data[5] = c;
      
      return m;
    }
  
    static perspective(fov: number, aspect: number, near: number, far: number): Matrix4 {
      const m = new Matrix4();
      const f = 1.0 / Math.tan(fov / 2);
      
      m.data[0] = f / aspect;
      m.data[5] = f;
      m.data[10] = (far + near) / (near - far);
      m.data[11] = -1;
      m.data[14] = (2 * far * near) / (near - far);
      m.data[15] = 0;
      
      return m;
    }
  
    static lookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4 {
      const m = new Matrix4();
      
      const zAxis = Vector3.subtract(eye, target);
      zAxis.normalize();
      
      const xAxis = Vector3.cross(up, zAxis);
      xAxis.normalize();
      
      const yAxis = Vector3.cross(zAxis, xAxis);
      yAxis.normalize();
      
      m.data[0] = xAxis.x;
      m.data[1] = yAxis.x;
      m.data[2] = zAxis.x;
      m.data[3] = 0;
      
      m.data[4] = xAxis.y;
      m.data[5] = yAxis.y;
      m.data[6] = zAxis.y;
      m.data[7] = 0;
      
      m.data[8] = xAxis.z;
      m.data[9] = yAxis.z;
      m.data[10] = zAxis.z;
      m.data[11] = 0;
      
      m.data[12] = -Vector3.dot(xAxis, eye);
      m.data[13] = -Vector3.dot(yAxis, eye);
      m.data[14] = -Vector3.dot(zAxis, eye);
      m.data[15] = 1;
      
      return m;
    }
  
    transformPoint(point: Vector3): Vector3 {
      const x = point.x * this.data[0] + point.y * this.data[4] + point.z * this.data[8] + this.data[12];
      const y = point.x * this.data[1] + point.y * this.data[5] + point.z * this.data[9] + this.data[13];
      const z = point.x * this.data[2] + point.y * this.data[6] + point.z * this.data[10] + this.data[14];
      const w = point.x * this.data[3] + point.y * this.data[7] + point.z * this.data[11] + this.data[15];
      
      if (w === 0) return new Vector3(0, 0, 0);
      
      return new Vector3(x / w, y / w, z / w);
    }
  }
  
  export class Color {
    constructor(public r: number, public g: number, public b: number, public a: number = 1.0) {}
    
    static fromHex(hex: number): Color {
      const r = (hex >> 16 & 255) / 255;
      const g = (hex >> 8 & 255) / 255;
      const b = (hex & 255) / 255;
      return new Color(r, g, b);
    }
    
    toRGBA(): string {
      const r = Math.floor(this.r * 255);
      const g = Math.floor(this.g * 255);
      const b = Math.floor(this.b * 255);
      return `rgba(${r}, ${g}, ${b}, ${this.a})`;
    }
  }