import { useState } from "preact/hooks";

export default function Tooltip({ text, children }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block">
            <div
                className="cursor-pointer"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                tabIndex="0"
            >
                {children}
            </div>

            {isVisible && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-sm text-white bg-slate-600 rounded-md shadow-lg">
                    {text}
                </div>
            )}
        </div>
    );
}
