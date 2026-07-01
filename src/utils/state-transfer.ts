import type { UserState } from '@/types/user-state';
import { migrateUserState } from '@/utils/storage';

const EXPORT_HEADER = 'FGO-MAT-CALC-STATE v1';
const FORMAT_VERSION = 1;

interface ExportEnvelope {
  app: 'fgo-mat-calc';
  formatVersion: number;
  exportedAt: string;
  state: UserState;
}

export function formatUserStateExport(state: UserState): string {
  const envelope: ExportEnvelope = {
    app: 'fgo-mat-calc',
    formatVersion: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };

  return `${EXPORT_HEADER}\n${JSON.stringify(envelope, null, 2)}\n`;
}

export function parseUserStateExport(text: string): UserState {
  const jsonText = extractJsonText(text);
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('入力データをJSONとして読めませんでした。');
  }

  const stateCandidate = isExportEnvelope(parsed) ? parsed.state : parsed;
  if (!isPotentialUserState(stateCandidate)) {
    throw new Error('FGO素材シミュレーターの設定データではありません。');
  }

  return migrateUserState(stateCandidate);
}

function extractJsonText(text: string): string {
  const trimmed = text.replace(/^\uFEFF/, '').trim();
  if (!trimmed) {
    throw new Error('入力データが空です。');
  }

  if (trimmed.startsWith(EXPORT_HEADER)) {
    return trimmed.slice(EXPORT_HEADER.length).trim();
  }

  return trimmed;
}

function isExportEnvelope(value: unknown): value is ExportEnvelope {
  return (
    value !== null &&
    typeof value === 'object' &&
    (value as Partial<ExportEnvelope>).app === 'fgo-mat-calc' &&
    typeof (value as Partial<ExportEnvelope>).state === 'object'
  );
}

function isPotentialUserState(value: unknown): value is Partial<UserState> {
  if (value === null || typeof value !== 'object') return false;

  return [
    'servants',
    'inventory',
    'roster',
    'classScore',
    'planning',
    'version',
  ].some((key) => key in value);
}
