export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;

  /**
   * 旋转角度，在计算 OBB 包围盒时有用
   */
  angle?: number;
}

export interface Point {
  x: number;
  y: number;
}
