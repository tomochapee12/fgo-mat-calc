import servantsData from '@data/servants.json';
import itemsData from '@data/items.json';
import manifestData from '@data/manifest.json';
import freeQuestDataJson from '@data/free-quests.json';
import classBoardDataJson from '@data/class-boards.json';
import type { Servant } from '@/types/servant';
import type { Item } from '@/types/item';
import type { FreeQuestData } from '@/types/free-quest';
import type { ClassBoardData } from '@/types/class-board';

export const servants: Servant[] = servantsData as unknown as Servant[];
export const items: Item[] = itemsData as unknown as Item[];
export const manifest = manifestData as { lastUpdated: string; collectionNos: number[] };
export const freeQuestData = freeQuestDataJson as FreeQuestData;
export const freeQuests = freeQuestData.quests;
export const classBoardData = classBoardDataJson as ClassBoardData;
export const classBoards = classBoardData.boards;
export const itemMap: Map<number, Item> = new Map(items.map((i) => [i.id, i]));
export const servantMap: Map<number, Servant> = new Map(
  servants.map((s) => [s.collectionNo, s])
);
export const classBoardMap = new Map(classBoards.map((board) => [board.id, board]));
