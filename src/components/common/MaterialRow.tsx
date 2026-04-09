import { itemMap } from '@/data/loader';
import { ItemIcon } from './ItemIcon';

interface MaterialRowProps {
  itemId: number;
  amount: number;
}

export function MaterialRow({ itemId, amount }: MaterialRowProps) {
  const item = itemMap.get(itemId);
  if (!item) return null;

  return (
    <div className="flex items-center gap-2">
      <ItemIcon icon={item.icon} name={item.name} size={32} />
      <span className="text-sm text-gray-200">{item.name}</span>
      <span className="text-sm text-yellow-400 ml-auto">×{amount}</span>
    </div>
  );
}
