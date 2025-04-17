import { Vector3, Color, Matrix4 } from './math';

export interface Face {
  vertices: Vector3[];
  normal: Vector3;
  color: Color;
  center: Vector3;
}

export class Cube {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: Color;
  
  private originalVertices: Vector3[];
  private transformedVertices: Vector3[];
  faces: Face[];
  
  private worldMatrix: Matrix4;
  private isTransparent: boolean = false;
  
  constructor(position: Vector3, color: Color = Color.fromHex(0xFFC0CB), size: number = 1.0) {
    this.position = position;
    this.rotation = new Vector3(0, 0, 0);
    this.scale = new Vector3(size, size, size);
    this.color = color;
    
    this.worldMatrix = new Matrix4();
    
    // Create vertices for a unit cube centered at origin
    this.originalVertices = [
      new Vector3(-0.5, -0.5, -0.5),
      new Vector3(0.5, -0.5, -0.5),
      new Vector3(0.5, 0.5, -0.5),
      new Vector3(-0.5, 0.5, -0.5),
      new Vector3(-0.5, -0.5, 0.5),
      new Vector3(0.5, -0.5, 0.5),
      new Vector3(0.5, 0.5, 0.5),
      new Vector3(-0.5, 0.5, 0.5)
    ];
    
    this.transformedVertices = this.originalVertices.map(v => v.clone());
    
    // Create pink color (0xFFC0CB)
    const pinkColor = new Color(1.0, 0.753, 0.796); // RGB values for #FFC0CB
    
    this.faces = [
      // Front face
      {
        vertices: [this.originalVertices[4], this.originalVertices[5], this.originalVertices[6], this.originalVertices[7]],
        normal: new Vector3(0, 0, 1),
        color: new Color(pinkColor.r, pinkColor.g, pinkColor.b),
        center: new Vector3(0, 0, 0.5)
      },
      // Back face
      {
        vertices: [this.originalVertices[1], this.originalVertices[0], this.originalVertices[3], this.originalVertices[2]],
        normal: new Vector3(0, 0, -1),
        color: new Color(pinkColor.r, pinkColor.g, pinkColor.b),
        center: new Vector3(0, 0, -0.5)
      },
      // Top face
      {
        vertices: [this.originalVertices[3], this.originalVertices[7], this.originalVertices[6], this.originalVertices[2]],
        normal: new Vector3(0, 1, 0),
        color: new Color(pinkColor.r, pinkColor.g, pinkColor.b),
        center: new Vector3(0, 0.5, 0)
      },
      // Bottom face
      {
        vertices: [this.originalVertices[0], this.originalVertices[1], this.originalVertices[5], this.originalVertices[4]],
        normal: new Vector3(0, -1, 0),
        color: new Color(pinkColor.r, pinkColor.g, pinkColor.b),
        center: new Vector3(0, -0.5, 0)
      },
      // Right face
      {
        vertices: [this.originalVertices[1], this.originalVertices[2], this.originalVertices[6], this.originalVertices[5]],
        normal: new Vector3(1, 0, 0),
        color: new Color(pinkColor.r, pinkColor.g, pinkColor.b),
        center: new Vector3(0.5, 0, 0)
      },
      // Left face
      {
        vertices: [this.originalVertices[0], this.originalVertices[4], this.originalVertices[7], this.originalVertices[3]],
        normal: new Vector3(-1, 0, 0),
        color: new Color(pinkColor.r, pinkColor.g, pinkColor.b),
        center: new Vector3(-0.5, 0, 0)
      }
    ];
    
    this.updateMatrix();
    this.updateFaceColors();
  }
  
  private updateFaceColors(): void {
    for (const face of this.faces) {
      face.color.r = face.color.r * this.color.r;
      face.color.g = face.color.g * this.color.g;
      face.color.b = face.color.b * this.color.b;
    }
  }
  
  setTransparent(transparent: boolean): void {
    this.isTransparent = transparent;
    for (const face of this.faces) {
      face.color.a = transparent ? 0.7 : 1.0;
    }
  }
  
  isTransparentMode(): boolean {
    return this.isTransparent;
  }
  
  updateMatrix(): void {
    // Create transformation matrices
    const translationMatrix = Matrix4.translation(this.position.x, this.position.y, this.position.z);
    const rotXMatrix = Matrix4.rotationX(this.rotation.x);
    const rotYMatrix = Matrix4.rotationY(this.rotation.y);
    const rotZMatrix = Matrix4.rotationZ(this.rotation.z);
    
    // Combine matrices: world = translation * rotZ * rotY * rotX
    let rotMatrix = Matrix4.multiply(rotXMatrix, rotYMatrix);
    rotMatrix = Matrix4.multiply(rotMatrix, rotZMatrix);
    this.worldMatrix = Matrix4.multiply(rotMatrix, translationMatrix);
    
    // Transform vertices
    for (let i = 0; i < this.originalVertices.length; i++) {
      const vertex = this.originalVertices[i];
      
      // Scale the vertex
      const scaledVertex = new Vector3(
        vertex.x * this.scale.x,
        vertex.y * this.scale.y,
        vertex.z * this.scale.z
      );
      
      // Apply world transformation
      this.transformedVertices[i] = this.worldMatrix.transformPoint(scaledVertex);
    }
    
    // Update face centers and normals
    for (const face of this.faces) {
      const sumX = face.vertices.reduce((sum, v) => sum + v.x, 0) / face.vertices.length;
      const sumY = face.vertices.reduce((sum, v) => sum + v.y, 0) / face.vertices.length;
      const sumZ = face.vertices.reduce((sum, v) => sum + v.z, 0) / face.vertices.length;
      
      face.center = new Vector3(sumX, sumY, sumZ);
      face.center = this.worldMatrix.transformPoint(
        new Vector3(
          face.center.x * this.scale.x,
          face.center.y * this.scale.y,
          face.center.z * this.scale.z
        )
      );
    }
  }
  
  update(): void {
    // Rotate the cube
    //this.rotation.x += 0.01;
    //this.rotation.y += 0.01;
    
    this.updateMatrix();
  }
  
  // For painter's algorithm - get transformed face normal
  private transformFaceNormal(face: Face): Vector3 {
    // Extract rotation matrix (3x3 part of world matrix)
    const m = this.worldMatrix.data;
    
    const rotMatrix = [
      m[0], m[1], m[2],
      m[4], m[5], m[6],
      m[8], m[9], m[10]
    ];
    
    // Apply rotation to normal
    const n = face.normal;
    const transformedNormal = new Vector3(
      rotMatrix[0] * n.x + rotMatrix[1] * n.y + rotMatrix[2] * n.z,
      rotMatrix[3] * n.x + rotMatrix[4] * n.y + rotMatrix[5] * n.z,
      rotMatrix[6] * n.x + rotMatrix[7] * n.y + rotMatrix[8] * n.z
    );
    
    transformedNormal.normalize();
    return transformedNormal;
  }
  
  getTransformedVertices(): Vector3[] {
    return this.transformedVertices;
  }
  
  getTransformedFaces(): Face[] {
    const transformedFaces: Face[] = [];
    
    for (const face of this.faces) {
      const faceIndex = this.faces.indexOf(face);
      const vertices: Vector3[] = [];
      
      // Get transformed vertices for this face
      if (faceIndex === 0) { // Front face
        vertices.push(
          this.transformedVertices[4],
          this.transformedVertices[5],
          this.transformedVertices[6],
          this.transformedVertices[7]
        );
      } else if (faceIndex === 1) { // Back face
        vertices.push(
          this.transformedVertices[1],
          this.transformedVertices[0],
          this.transformedVertices[3],
          this.transformedVertices[2]
        );
      } else if (faceIndex === 2) { // Top face
        vertices.push(
          this.transformedVertices[3],
          this.transformedVertices[7],
          this.transformedVertices[6],
          this.transformedVertices[2]
        );
      } else if (faceIndex === 3) { // Bottom face
        vertices.push(
          this.transformedVertices[0],
          this.transformedVertices[1],
          this.transformedVertices[5],
          this.transformedVertices[4]
        );
      } else if (faceIndex === 4) { // Right face
        vertices.push(
          this.transformedVertices[1],
          this.transformedVertices[2],
          this.transformedVertices[6],
          this.transformedVertices[5]
        );
      } else if (faceIndex === 5) { // Left face
        vertices.push(
          this.transformedVertices[0],
          this.transformedVertices[4],
          this.transformedVertices[7],
          this.transformedVertices[3]
        );
      }
      
      transformedFaces.push({
        vertices,
        normal: this.transformFaceNormal(face),
        color: face.color,
        center: face.center
      });
    }
    
    return transformedFaces;
  }
}