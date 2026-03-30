"use client";
import { useRef, useEffect } from "react";

type Mode = "act" | "speak" | "see";

export type Message = {
    id: number;
    role: "narrator" | "player";
    mode?: Mode;
    content: string;
    imageUrl?: string;
};

type Props = {
    messages: Message[];
    loading: boolean;
    elapsed: number;
    editingId: number | null;
    editText: string;
    generatingImgId: number | null;
    generatedImages: Record<number, string>;
    onEditStart: (msg: Message) => void;
    onEditTextChange: (v: string) => void;
    onEditConfirm: (msg: Message) => void;
    onEditCancel: () => void;
    onRegenerate: () => void;
    onGenerateImage: (msg: Message) => void;
};

export default function MessageList({
    messages, loading, elapsed,
    editingId, editText, generatingImgId, generatedImages,
    onEditStart, onEditTextChange, onEditConfirm, onEditCancel,
    onRegenerate, onGenerateImage,
}: Props) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const lastNarratorId = messages.filter(m => m.role === "narrator").slice(-1)[0]?.id;

    return (
        <div className="flex-1 overflow-y-auto space-y-14 py-12 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[40vh] space-y-6 opacity-40">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">auto_stories</span>
                    <div className="text-center space-y-2">
                        <p className="font-serif italic text-lg text-on-surface-variant">The world awaits your first move.</p>
                        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Choose Act, Speak, or See, then begin.</p>
                    </div>
                </div>
            )}

            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`group flex flex-col max-w-2xl space-y-2 ${msg.role === "player" ? "items-end ml-auto" : "items-start"}`}
                >
                    <div className={`flex items-center gap-3 mb-2 ${msg.role === "player" ? "flex-row-reverse" : ""}`}>
                        <span className={`text-[9px] uppercase font-sans tracking-[0.3em] ${msg.role === "player" ? "text-secondary/60" : "text-on-surface/40"}`}>
                            {msg.role === "narrator" ? "The Narrator" : msg.mode === "speak" ? "You — Speaking" : msg.mode === "see" ? "You — Seeing" : "You — Acting"}
                        </span>
                        {/* Actions */}
                        {!loading && msg.role === "narrator" && msg.content !== "" && (
                            <>
                                {msg.id === lastNarratorId && (
                                    <button onClick={onRegenerate} title="Regenerate response"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface/30 hover:text-primary">
                                        <span className="material-symbols-outlined text-sm">refresh</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => onGenerateImage(msg)}
                                    disabled={generatingImgId !== null}
                                    title="Generate image for this scene"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface/30 hover:text-primary disabled:opacity-20"
                                >
                                    <span className={`material-symbols-outlined text-sm ${generatingImgId === msg.id ? "animate-pulse text-primary/60" : ""}`}>
                                        {generatingImgId === msg.id ? "hourglass_top" : "image"}
                                    </span>
                                </button>
                            </>
                        )}
                        {!loading && msg.role === "player" && editingId !== msg.id && (
                            <button
                                onClick={() => onEditStart(msg)}
                                title="Edit message"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface/30 hover:text-primary"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        )}
                    </div>

                    <div className={`text-on-surface leading-relaxed w-full ${msg.role === "narrator" ? "chat-bubble-narrator" : "chat-bubble-traveler"}`}>
                        {editingId === msg.id ? (
                            <div className="flex flex-col gap-2 items-end">
                                <textarea
                                    autoFocus
                                    value={editText}
                                    onChange={e => onEditTextChange(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEditConfirm(msg); }
                                        if (e.key === "Escape") onEditCancel();
                                    }}
                                    className="w-full bg-transparent border-b border-outline/50 focus:border-primary text-xl font-serif italic text-on-surface outline-none resize-none leading-relaxed py-1 transition-colors"
                                    rows={Math.max(2, editText.split("\n").length)}
                                />
                                <div className="flex gap-3">
                                    <button onClick={onEditCancel} className="font-sans text-[9px] uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors">Cancel</button>
                                    <button onClick={() => onEditConfirm(msg)} className="font-sans text-[9px] uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">Confirm</button>
                                </div>
                            </div>
                        ) : msg.role === "narrator" && msg.content === "" && !msg.imageUrl ? (
                            <p className="font-serif italic text-on-surface/50 text-lg">
                                {msg.mode === "see" || (loading && messages[messages.length - 1]?.id === msg.id && messages.find(m => m.mode === "see" && m.role === "player"))
                                    ? elapsed < 5 ? "Painting the scene\u2026" : `Generating image\u2026 (${elapsed}s)`
                                    : elapsed < 5 ? "The world stirs\u2026" : elapsed < 15 ? "The narrator is thinking\u2026" : `Still thinking\u2026 (${elapsed}s)`}
                            </p>
                        ) : msg.imageUrl ? (
                            <img
                                src={msg.imageUrl}
                                alt={msg.content || "Generated scene"}
                                className="max-w-full rounded-sm border border-outline/40"
                            />
                        ) : (
                            <>
                                <p className={`text-xl font-serif ${msg.role === "player" ? "italic" : ""}`}>{msg.content}</p>
                                {generatedImages[msg.id] && (
                                    <img
                                        src={generatedImages[msg.id]}
                                        alt="Generated scene"
                                        className="mt-4 max-w-full rounded-sm border border-outline/40"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}
