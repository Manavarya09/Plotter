"use client";
import { useRef } from "react";

type Mode = "act" | "speak" | "see";

const PLACEHOLDERS: Record<Mode, string> = {
    act: "What do you do...",
    speak: "What do you say...",
    see: "Describe the scene you want to see...",
};

type Props = {
    mode: Mode;
    input: string;
    loading: boolean;
    onModeChange: (m: Mode) => void;
    onInputChange: (v: string) => void;
    onSend: () => void;
};

export default function ChatInput({ mode, input, loading, onModeChange, onInputChange, onSend }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
        if (e.key === "Escape") onInputChange("");
    };

    return (
        <div className="absolute bottom-0 left-0 w-full px-8 pb-10 bg-gradient-to-t from-background via-background to-transparent pt-20">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-center space-x-10">
                    {(["act", "speak", "see"] as Mode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => { onModeChange(m); inputRef.current?.focus(); }}
                            className={`group flex flex-col items-center space-y-1 transition-opacity ${mode === m ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                        >
                            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-on-surface capitalize">{m}</span>
                            <div className={`h-[1px] bg-primary transition-all duration-300 ${mode === m ? "w-8" : "w-0 group-hover:w-4"}`} />
                        </button>
                    ))}
                </div>
                <div className="relative border-b border-on-surface/20 py-2 flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={e => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/30 px-0 font-serif italic text-xl outline-none"
                        placeholder={PLACEHOLDERS[mode]}
                    />
                    <button
                        onClick={onSend}
                        disabled={!input.trim() || loading}
                        className="ml-4 text-on-surface/40 hover:text-primary transition-colors disabled:opacity-20"
                    >
                        <span className="material-symbols-outlined text-2xl">north</span>
                    </button>
                </div>
                <div className="flex justify-center">
                    <p className="text-[9px] text-on-surface/30 font-sans tracking-[0.3em] uppercase">Enter to send • Esc to clear</p>
                </div>
            </div>
        </div>
    );
}
