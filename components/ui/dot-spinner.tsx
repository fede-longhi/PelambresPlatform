export default function DotSpinner() {
    return (
        <div className="flex space-x-2">
            <div className="w-4 h-4 bg-violet-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-violet-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-4 h-4 bg-violet-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
    )
}