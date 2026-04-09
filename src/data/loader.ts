import servantsData from '@data/servants.json';
import itemsData from '@data/items.json';
import type { Servant } from '@/types/servant';
import type { Item } from '@/types/item';

export const servants: Servant[] = servantsData as unknown as Servant[];
export const items: Item[] = itemsData as unknown as Item[];
export const itemMap: Map<number, Item> = new Map(items.map((i) => [i.id, i]));
export const servantMap: Map<number, Servant> = new Map(
  servants.map((s) => [s.collectionNo, s])
);
