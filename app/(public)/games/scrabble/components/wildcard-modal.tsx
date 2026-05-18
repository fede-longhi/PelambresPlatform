export const WildCardModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (letter: string) => void }) => {
    if (!isOpen) return null;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="flex flex-col bg-white rounded w-full md:w-[60%]">
                <h1 className="text-center p-4">Select a letter for the wildcard</h1>
                <div className="flex flex-row flex-wrap justify-center p-4 gap-2 md:gap-4">
                    {
                        letters.map(letter => (
                            <button 
                                key={letter}
                                className="w-8 h-8 p-3 bg-gradient-to-br from-[#fffdf2] to-[#e8e2c4]
                                border-b-4 border-r-2 border-[#b5ad8d]
                                rounded-md shadow-md transition-colors
                                font-semibold text-center justify-center flex items-center
                                hover:-translate-y-0.5 transform
                                hover:from-[#beb269] hover:to-[#beb269] hover:border-[#8b7d4a]"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect(letter);
                                    onClose();
                                }}
                            >
                                {letter}
                            </button>
                        ))
                    }
                </div>
            </div>
        </div>
    )

}