import { useCallback, useEffect, useRef } from 'preact/hooks';

export default function TextArea({ value = '', placeholder, onKeyDown = () => null }) {
    const textareaRef = useRef(null);

    const onInput = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [textareaRef.current])

    return (
        <textarea
            ref={textareaRef}
            type="text"
            placeholder={placeholder}
            className="max-w-xs border-none p-0.5 text-sm font-normal bg-slate-700 text-white transition duration-200 outline-none focus:outline-none break-words resize-none"
            value={value}
            onKeyDown={onKeyDown}
            onInput={onInput}
        />
    );
};
