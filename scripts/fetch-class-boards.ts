import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.atlasacademy.io';
const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');
const NORMAL_CLASS_BOARD_ID_MAX = 9999;

interface AtlasItem {
  id: number;
  name: string;
}

interface AtlasItemAmount {
  item?: AtlasItem | null;
  amount: number;
}

interface AtlasClassBoard {
  id: number;
  name: string;
  icon?: string;
  classes?: {
    classId: number;
    className: string;
  }[];
  dispItems?: AtlasItem[];
  squares?: AtlasClassBoardSquare[];
  lines?: AtlasClassBoardLine[];
}

interface AtlasClassBoardSquare {
  id: number;
  icon?: string;
  items?: AtlasItemAmount[];
  posX: number;
  posY: number;
  skillType: string;
  targetSkill?: {
    name?: string;
    detail?: string;
    icon?: string;
  };
  targetCommandSpell?: {
    name?: string;
    detail?: string;
  };
  flags?: string[];
  priority?: number;
  lock?: {
    id: number;
    condType: string;
    condTargetId: number;
    condNum: number;
    closedMessage?: string;
    items?: AtlasItemAmount[];
  };
}

interface AtlasClassBoardLine {
  id: number;
  prevSquareId: number;
  nextSquareId: number;
}

interface ClassBoardData {
  generatedAt: string;
  source: string;
  boards: TransformedClassBoard[];
}

interface TransformedClassBoard {
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
  squares: TransformedClassBoardSquare[];
  lines: AtlasClassBoardLine[];
}

interface TransformedClassBoardSquare {
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
  items: {
    itemId: number;
    amount: number;
  }[];
  lock?: {
    id: number;
    condType: string;
    condTargetId: number;
    condNum: number;
    message: string;
    itemIds: number[];
  };
}

function transformItems(items: AtlasItemAmount[] | undefined): {
  qp: number;
  items: { itemId: number; amount: number }[];
} {
  let qp = 0;
  const materials: { itemId: number; amount: number }[] = [];

  for (const entry of items ?? []) {
    const itemId = entry.item?.id;
    const amount = Math.max(0, Math.floor(Number(entry.amount) || 0));
    if (!itemId || amount <= 0) continue;
    if (itemId === 1) {
      qp += amount;
    } else {
      materials.push({ itemId, amount });
    }
  }

  return { qp, items: materials };
}

function transformSquare(square: AtlasClassBoardSquare): TransformedClassBoardSquare {
  const cost = transformItems(square.items);
  const lockItems = transformItems(square.lock?.items);
  const name =
    square.targetSkill?.name ??
    square.targetCommandSpell?.name ??
    (square.lock ? 'ツアーロック' : square.flags?.includes('blank') ? '空白ノード' : `ノード ${square.id}`);
  const detail =
    square.targetSkill?.detail ??
    square.targetCommandSpell?.detail ??
    square.lock?.closedMessage ??
    '';

  return {
    id: square.id,
    icon: square.icon ?? square.targetSkill?.icon ?? '',
    x: square.posX,
    y: square.posY,
    name,
    detail,
    skillType: square.lock ? 'lock' : square.skillType,
    flags: square.flags ?? [],
    priority: square.priority ?? 0,
    qp: cost.qp + lockItems.qp,
    items: [...cost.items, ...lockItems.items],
    lock: square.lock
      ? {
          id: square.lock.id,
          condType: square.lock.condType,
          condTargetId: square.lock.condTargetId,
          condNum: square.lock.condNum,
          message: square.lock.closedMessage ?? '',
          itemIds: lockItems.items.map((entry) => entry.itemId),
        }
      : undefined,
  };
}

function transformBoard(board: AtlasClassBoard): TransformedClassBoard {
  const squares = (board.squares ?? []).map(transformSquare);
  const xs = squares.map((square) => square.x);
  const ys = squares.map((square) => square.y);

  return {
    id: board.id,
    name: board.name,
    icon: board.icon ?? '',
    classes: (board.classes ?? []).map((entry) => ({
      classId: entry.classId,
      className: entry.className,
    })),
    displayItemIds: (board.dispItems ?? []).map((item) => item.id),
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    },
    squares,
    lines: board.lines ?? [],
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  console.log('Fetching Atlas class boards...');
  const boards = await fetchJson<AtlasClassBoard[]>(
    `${API_BASE}/export/JP/nice_class_board.json`
  );

  const data: ClassBoardData = {
    generatedAt: new Date().toISOString(),
    source: `${API_BASE}/export/JP/nice_class_board.json`,
    boards: boards
      .filter((board) => board.id <= NORMAL_CLASS_BOARD_ID_MAX)
      .map(transformBoard),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, 'class-boards.json'),
    JSON.stringify(data, null, 2)
  );

  console.log(`Saved ${data.boards.length} class boards to data/class-boards.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
