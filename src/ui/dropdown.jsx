import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import VerticalDots from "./svgs/VerticalDots";

export default function Dropdown({ options, selected, onClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(selected);
    const dropdownRef = useRef(null);

    const handleOptionClick = useCallback((option) => {
        setSelectedOption(option);
        onClick?.(option);
        setIsOpen(false);
    }, []);

    useEffect(() => setSelectedOption(selected), [selected]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left max-w-[130px]" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    id="menu-button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-row gap-x-1 items-center"
                >
                    <span
                        className="text-xs overflow-ellipsis overflow-hidden break-words"
                        style={{
                            display: "-webkit-box",
                            "-webkit-line-clamp": 1,
                            "-webkit-box-orient": "vertical"
                        }}>
                        {selectedOption || 'Select a model'}
                    </span>
                    <div className="dark:invert-0">
                        <VerticalDots />
                    </div>
                </button>
            </div>
            {isOpen && (
                <div
                    className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} max-h-48 overflow-y-auto`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex="-1"
                >
                    <div className="py-1" role="none">
                        {options.map((option, index) =>
                            <span
                                key={index}
                                className={`block px-2 py-1 text-xs cursor-pointer 
                                    ${selectedOption === option ? 'bg-slate-400 text-white' : 'text-gray-700'} 
                                    hover:bg-slate-600 hover:text-white`}
                                role="menuitem"
                                tabIndex="-1"
                                id={`menu-item-${index}`}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
