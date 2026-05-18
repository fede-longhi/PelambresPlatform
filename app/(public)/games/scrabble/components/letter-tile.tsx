import { LetterTile } from "../types";

const LetterTileComponent = (tile: LetterTile) => {
    return (
        <div className={`
            relative w-7 h-8 md:w-10 md:h-10
            flex items-center justify-center 
            rounded-md 
            transition-all transform
            bg-gradient-to-br from-[#fffdf2] to-[#e8e2c4]
            border-b-4 border-r-2 border-[#b5ad8d]
            shadow-md
            ${tile.isFixed ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5'}
            ${tile.selected ? 'ring-4 ring-yellow-400' : ''}
        `}>
            <div className="absolute border-t border-l border-white/60 rounded-sm pointer-events-none" />
            {
                tile.isWildcard && tile.letter !== '' &&
                <div className="absolute inset-0 m-1 bg-slate-400 rounded-full"></div>
            }
            <span className={`text-xl font-semibold ${tile.isWildcard ? 'text-zinc-100' : 'text-zinc-800'} select-none drop-shadow-sm`}>
                {tile.letter.toUpperCase()}
            </span>

            <span className="absolute bottom-0 right-0.5 text-[7px] md:text-[9px] font-bold text-zinc-700 select-none">
                {tile.score}
            </span>
        </div>
    );
};

export default LetterTileComponent;