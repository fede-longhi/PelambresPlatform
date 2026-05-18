import { cn } from "@/lib/utils";
import { LetterTile } from "../types";
import LetterTileComponent from "./letter-tile";

const PlayerRack = ({ tiles, onTileClick, className }: { tiles: (LetterTile | null)[], onTileClick?: (e: React.PointerEvent, tile: LetterTile | null, index: number) => void, className?: string }) => {
  return (
    <div className={cn(className, `
      mx-auto
      flex justify-center items-end gap-2 md:gap-4
      p-3 md:p-5
      bg-[#4a3728]
      border-t-[6px] border-[#6b543e]
      border-b-[4px] border-b-[#3d2c1f]
      rounded-t-2xl lg:rounded-2xl
      shadow-[0_-4px_15px_rgba(0,0,0,0.5)]
    `)}>
        {tiles && tiles.map((tile, index) => tile ? 
            <div
                key={index}
                className="relative transform hover:-translate-y-1 transition-transform"
                onPointerDown={(e) => onTileClick?.(e, tile, index)}
            >
                <LetterTileComponent {...tile} />
            </div>
            :
            <div 
                key={`empty-${index}`} 
                className="flex shrink-0 w-8 h-8 md:w-10 md:h-10 bg-black/20 rounded-md border-b-2 border-white/10 shadow-inner" 
                onPointerDown={(e) => onTileClick?.(e, null, index)}
            ></div>
        )}
    </div>
  );
};

export default PlayerRack;