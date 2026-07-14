import type { Config } from '@react-router/dev/config';
import { readFileSync } from 'node:fs';

interface ServantForRoutes {
  collectionNo: number;
  ascension: Record<string, { materials: { itemId: number }[] }>;
  skills: Record<string, { materials: { itemId: number }[] }>;
  appendSkills: Record<string, { materials: { itemId: number }[] }>;
  costumes: Record<string, { materials: { itemId: number }[] }>;
}

interface ClassBoardForRoutes {
  id: number;
  squares: { items: { itemId: number }[] }[];
}

const servants = JSON.parse(
  readFileSync(new URL('./data/servants.json', import.meta.url), 'utf8')
) as ServantForRoutes[];
const classBoards = JSON.parse(
  readFileSync(new URL('./data/class-boards.json', import.meta.url), 'utf8')
) as { boards: ClassBoardForRoutes[] };

const materialIds = new Set<number>();
for (const servant of servants) {
  for (const costs of [
    servant.ascension,
    servant.skills,
    servant.appendSkills,
    servant.costumes,
  ]) {
    for (const cost of Object.values(costs)) {
      for (const material of cost.materials) materialIds.add(material.itemId);
    }
  }
}
for (const board of classBoards.boards) {
  for (const square of board.squares) {
    for (const material of square.items) materialIds.add(material.itemId);
  }
}

export default {
  appDirectory: 'src',
  buildDirectory: 'dist',
  ssr: false,
  prerender: {
    paths: [
      '/',
      '/servants/',
      ...servants.map((servant) => `/servants/${servant.collectionNo}/`),
      '/materials/',
      ...[...materialIds].sort((a, b) => a - b).map((itemId) => `/materials/${itemId}/`),
      '/class-score/',
      ...classBoards.boards.map((board) => `/class-score/${board.id}/`),
      '/guide/usage/',
      '/updates/',
    ],
    concurrency: 8,
  },
} satisfies Config;
