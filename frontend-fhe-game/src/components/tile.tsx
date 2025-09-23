import { useEffect, useState } from "react";
import { Tile as TileProps } from "@/models/tile";
import styles from "@/styles/tile.module.css";
import usePreviousProps from "@/hooks/use-previous-props";

export default function Tile({ position, value }: TileProps) {
  const [scale, setScale] = useState(1);
  const previousValue = usePreviousProps<number>(value);
  const hasChanged = previousValue !== value;

  // Calculate position based on CSS Grid
  const calculatePosition = (x: number, y: number) => {
    const cellSize = 'calc(100% / 4 - 10px)';
    const gap = 10;
    return {
      left: `calc(${x} * (100% / 4))`,
      top: `calc(${y} * (100% / 4))`,
    };
  };

  useEffect(() => {
    if (hasChanged) {
      setScale(1.1);
      setTimeout(() => setScale(1), 100);
    }
  }, [hasChanged]);

  const positionStyle = calculatePosition(position[0], position[1]);
  
  const style = {
    ...positionStyle,
    transform: `scale(${scale})`,
    zIndex: value,
  };

  return (
    <div className={`${styles.tile} ${styles[`tile${value}`]}`} style={style}>
      {value}
    </div>
  );
}
