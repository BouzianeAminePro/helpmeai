import { useCallback } from "preact/hooks";
import Tooltip from "./tooltip";

export default function Button({ onClick, disabled, isRunning, fallback, tooltip, children }) {
    const render = useCallback((elems) =>
        tooltip ?
            <Tooltip text={tooltip}>
                {elems}
            </Tooltip> :
            <>{elems}</>
        , [tooltip]);

    return render(
        <span className="relative flex">
            <button
                onClick={onClick}
                disabled={disabled}
                className={`px-4 py-2 text-black font-semibold w-fit rounded-lg shadow-md transition-colors duration-200 ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
            >
                {
                    isRunning ? (
                        <>
                            {fallback}
                            <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                            </span>
                        </>
                    ) : children
                }
            </button>
        </span>
    )
}
