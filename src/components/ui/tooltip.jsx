import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export default function Tooltip({ text, children, forceVisible = false, bgColor = "bg-slate-600" }) {
    const [isVisible, setIsVisible] = useState(false);

    const hide = useCallback(() => !forceVisible && setIsVisible(false), [forceVisible]);
    const show = useCallback(() => !forceVisible && setIsVisible(true), [forceVisible]);

    const containerRef = useRef(null);

    useEffect(() => {
        if (!forceVisible) {
            setIsVisible(false);
        }
    }, [forceVisible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                hide()
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block" ref={containerRef}>
            <div
                className="cursor-pointer"
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                tabIndex="0"
            >
                {children}
            </div>

            {isVisible && (
                <div
                    className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-sm text-white ${bgColor} rounded-md shadow-lg`}
                >
                    {text}
                </div>
            )}
        </div>
    );
}
