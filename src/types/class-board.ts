export interface ClassBoardMaterialRequirement {
  itemId: number;
  amount: number;
}

export interface ClassBoardLock {
  id: number;
  condType: string;
  condTargetId: number;
  condNum: number;
  message: string;
  itemIds: number[];
}

export interface ClassBoardSquare {
  id: number;
  icon: string;
  x: number;
  y: number;
  name: string;
  detail: string;
  skillType: string;
  flags: string[];
  priority: number;
  qp: number;
  items: ClassBoardMaterialRequirement[];
  lock?: ClassBoardLock;
}

export interface ClassBoardLine {
  id: number;
  prevSquareId: number;
  nextSquareId: number;
}

export interface ClassBoard {
  id: number;
  name: string;
  icon: string;
  classes: {
    classId: number;
    className: string;
  }[];
  displayItemIds: number[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  squares: ClassBoardSquare[];
  lines: ClassBoardLine[];
}

export interface ClassBoardData {
  generatedAt: string;
  source: string;
  boards: ClassBoard[];
}
