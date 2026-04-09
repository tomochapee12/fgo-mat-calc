interface ItemIconProps {
  icon: string;
  name: string;
  size?: number;
}

export function ItemIcon({ icon, name, size = 40 }: ItemIconProps) {
  return (
    <img
      src={icon}
      alt={name}
      width={size}
      height={size}
      className="rounded"
      loading="lazy"
    />
  );
}
