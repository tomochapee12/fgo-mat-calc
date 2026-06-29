import fs from 'fs';
import path from 'path';

const API_BASE = 'https://api.atlasacademy.io';
const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');
const FAR_FUTURE_CLOSE = 1893423600; // 2030-01-01 JST in Atlas data
const CONCURRENCY = 8;

interface AtlasWar {
  id: number;
  name: string;
  longName: string;
  spots?: AtlasSpot[];
}

interface AtlasSpot {
  id: number;
  name: string;
  quests?: AtlasQuestSummary[];
}

interface AtlasQuestSummary {
  id: number;
  name: string;
  type: string;
  consumeType: string;
  consume: number;
  afterClear: string;
  phases?: number[];
  openedAt?: number;
  closedAt?: number;
}

interface AtlasQuestDrop {
  type: string;
  objectId: number;
  num: number;
  runs?: number;
  dropExpected?: number;
}

interface AtlasQuestDetail {
  id: number;
  name: string;
  type: string;
  consume: number;
  spotName: string;
  warId: number;
  warLongName: string;
  exp: number;
  bond: number;
  openedAt: number;
  closedAt: number;
  drops?: AtlasQuestDrop[];
  stages?: {
    enemies?: {
      name?: string;
      svt?: {
        className?: string;
        traits?: { id: number; name: string }[];
      };
    }[];
  }[];
}

interface FreeQuestData {
  generatedAt: string;
  source: string;
  quests: FreeQuest[];
}

interface FreeQuest {
  id: number;
  phase: number;
  name: string;
  spotName: string;
  warId: number;
  warLongName: string;
  ap: number;
  bond: number;
  exp: number;
  openedAt: number;
  closedAt: number;
  drops: {
    itemId: number;
    expected: number;
    runs: number;
  }[];
  enemyTraits: string[];
  enemyClasses: string[];
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function transformQuest(detail: AtlasQuestDetail, phase: number): FreeQuest {
  const enemies = detail.stages?.flatMap((stage) => stage.enemies ?? []) ?? [];

  return {
    id: detail.id,
    phase,
    name: detail.name,
    spotName: detail.spotName,
    warId: detail.warId,
    warLongName: detail.warLongName.replace(/\n/g, ' '),
    ap: detail.consume,
    bond: detail.bond,
    exp: detail.exp,
    openedAt: detail.openedAt,
    closedAt: detail.closedAt,
    drops:
      detail.drops
        ?.filter((drop) => drop.type === 'item' && drop.dropExpected)
        .map((drop) => ({
          itemId: drop.objectId,
          expected: Number(drop.dropExpected ?? 0),
          runs: Number(drop.runs ?? 0),
        }))
        .filter((drop) => drop.expected > 0) ?? [],
    enemyTraits: uniqueSorted(
      enemies.flatMap((enemy) =>
        (enemy.svt?.traits ?? []).map((trait) => trait.name)
      )
    ),
    enemyClasses: uniqueSorted(
      enemies.map((enemy) => enemy.svt?.className ?? '')
    ),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return (await res.json()) as T;
}

async function main(): Promise<void> {
  console.log('Fetching Atlas wars...');
  const wars = await fetchJson<AtlasWar[]>(
    `${API_BASE}/export/JP/nice_war.json`
  );

  const candidates = wars.flatMap((war) =>
    (war.spots ?? []).flatMap((spot) =>
      (spot.quests ?? [])
        .filter(
          (quest) =>
            quest.type === 'free' &&
            quest.consumeType === 'ap' &&
            quest.afterClear === 'repeatLast' &&
            (quest.closedAt ?? 0) >= FAR_FUTURE_CLOSE
        )
        .map((quest) => ({
          id: quest.id,
          phase: Math.max(...(quest.phases?.length ? quest.phases : [1])),
          name: quest.name,
          warName: war.longName,
          spotName: spot.name,
        }))
    )
  );

  console.log(`Found ${candidates.length} permanent free quests`);

  const quests: FreeQuest[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= candidates.length) return;

      const candidate = candidates[index];
      const url = `${API_BASE}/nice/JP/quest/${candidate.id}/${candidate.phase}`;
      try {
        const detail = await fetchJson<AtlasQuestDetail>(url);
        const quest = transformQuest(detail, candidate.phase);
        if (quest.ap > 0 && quest.drops.length > 0) {
          quests.push(quest);
        }
        console.log(
          `[${index + 1}/${candidates.length}] ${candidate.warName.replace(/\n/g, ' ')} / ${candidate.name}`
        );
      } catch (error) {
        console.warn(`Skipped ${candidate.id}/${candidate.phase}:`, error);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, candidates.length) }, () =>
      worker()
    )
  );

  const data: FreeQuestData = {
    generatedAt: new Date().toISOString(),
    source: 'https://api.atlasacademy.io',
    quests: quests.sort((a, b) => a.warId - b.warId || a.id - b.id),
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, 'free-quests.json'),
    JSON.stringify(data, null, 2)
  );

  console.log(`Saved ${quests.length} quests to data/free-quests.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
