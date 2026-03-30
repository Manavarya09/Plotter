"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GetOllamaModels, UpdateStory, UpdateStorySettings, PickStoryCoverImage, ClearStoryCoverImage } from "@/lib/wails";

type Character = { id: string; name: string; description: string };

type Story = {
    id: string;
    title: string;
    genre: string;
    synopsis: string;
    coverImage: string;
    activeModel: string;
    nsfw: boolean;
    aiInstructions: string;
    authorNotes: string;
    storyOutline: string;
    characters: Character[];
};

type OllamaModel = { name: string };

function genId() {
    return Math.random().toString(36).slice(2);
}

interface Props {
    story: Story;
    onStoryChange: (updated: Story) => void;
    onWidthChange?: (width: number) => void;
}

export default function StorySettingsPanel({ story, onStoryChange, onWidthChange }: Props) {
    const [panelWidth, setPanelWidth] = useState(288);
    const isResizing = useRef(false);
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [title, setTitle] = useState(story.title ?? "");
    const [genre, setGenre] = useState(story.genre ?? "");
    const [synopsis, setSynopsis] = useState(story.synopsis ?? "");
    const [activeModel, setActiveModel] = useState(story.activeModel ?? "");
    const [nsfw, setNsfw] = useState(story.nsfw ?? false);
    const [aiInstructions, setAiInstructions] = useState(story.aiInstructions ?? "");
    const [authorNotes, setAuthorNotes] = useState(story.authorNotes ?? "");
    const [storyOutline, setStoryOutline] = useState(story.storyOutline ?? "");
    const [characters, setCharacters] = useState<Character[]>(story.characters ?? []);
    const [expandedChar, setExpandedChar] = useState<string | null>(null);

    useEffect(() => {
        GetOllamaModels().then(ms => setModels((ms ?? []) as unknown as OllamaModel[])).catch(() => {});
    }, []);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const w = Math.min(Math.max(e.clientX, 200), 520);
            setPanelWidth(w);
            onWidthChange?.(w);
        };
        const onUp = () => { isResizing.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }, [onWidthChange]);

    const saveStoryInfo = async (overrides?: Partial<{ title: string; genre: string; synopsis: string }>) => {
        const vals = { title, genre, synopsis, ...overrides };
        try {
            const updated = await UpdateStory(story.id, vals.title, vals.genre, vals.synopsis);
            onStoryChange(updated as unknown as Story);
        } catch (e) {
            console.error("Failed to update story info", e);
        }
    };

    const save = async (overrides?: Partial<{
        activeModel: string; nsfw: boolean; aiInstructions: string;
        authorNotes: string; storyOutline: string; characters: Character[];
    }>) => {
        const vals = {
            activeModel, nsfw, aiInstructions, authorNotes, storyOutline, characters,
            ...overrides,
        };
        try {
            const updated = await UpdateStorySettings(
                story.id,
                vals.activeModel,
                vals.nsfw,
                vals.aiInstructions,
                vals.authorNotes,
                vals.storyOutline,
                JSON.stringify(vals.characters),
            );
            onStoryChange(updated as unknown as Story);
        } catch (e) {
            console.error("Failed to save story settings", e);
        }
    };

    const addCharacter = () => {
        const newChar: Character = { id: genId(), name: "", description: "" };
        const next = [...characters, newChar];
        setCharacters(next);
        setExpandedChar(newChar.id);
        save({ characters: next });
    };

    const updateChar = (id: string, field: "name" | "description", value: string) => {
        const next = characters.map(c => c.id === id ? { ...c, [field]: value } : c);
        setCharacters(next);
    };

    const saveChars = () => save({ characters });

    const deleteChar = (id: string) => {
        const next = characters.filter(c => c.id !== id);
        setCharacters(next);
        save({ characters: next });
    };

    return (
        <aside
            className="fixed left-0 top-0 h-screen bg-surface flex flex-col z-40 overflow-hidden"
            style={{ width: panelWidth }}
        >
            {/* Resize handle */}
            <div
                className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-primary/30 transition-colors group z-50"
                onMouseDown={e => {
                    e.preventDefault();
                    isResizing.current = true;
                    document.body.style.cursor = "col-resize";
                    document.body.style.userSelect = "none";
                }}
            >
                <div className="absolute inset-y-0 -left-px right-0 w-[1px] bg-outline/20 group-hover:bg-primary/40 transition-colors" />
            </div>
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline/40 shrink-0">
                <Link href="/" className="flex items-center space-x-2 text-on-surface-variant hover:text-on-surface transition-colors mb-4">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="font-sans text-[9px] uppercase tracking-widest">Manuscripts</span>
                </Link>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onBlur={() => saveStoryInfo()}
                    className="w-full bg-transparent font-serif text-base text-on-surface font-bold leading-snug outline-none border-b border-transparent focus:border-outline/50 transition-colors placeholder:text-on-surface-variant/30"
                    placeholder="Untitled"
                />
                <input
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    onBlur={() => saveStoryInfo()}
                    placeholder="Genre"
                    className="w-full bg-transparent font-sans text-[9px] uppercase tracking-widest text-secondary mt-1 outline-none border-b border-transparent focus:border-outline/50 transition-colors placeholder:text-on-surface-variant/30"
                />
                <textarea
                    value={synopsis}
                    onChange={e => setSynopsis(e.target.value)}
                    onBlur={() => saveStoryInfo()}
                    rows={2}
                    placeholder="Synopsis..."
                    className="w-full bg-transparent font-serif text-xs text-on-surface-variant mt-2 outline-none resize-none border-b border-transparent focus:border-outline/50 transition-colors placeholder:text-on-surface-variant/30 leading-relaxed"
                />
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

                {/* Cover Image */}
                <div className="border-b border-outline/40">
                    <div
                        className="relative w-full aspect-video bg-surface-container cursor-pointer group overflow-hidden"
                        onClick={async () => {
                            const updated = await PickStoryCoverImage(story.id) as unknown as Story;
                            onStoryChange(updated);
                        }}
                    >
                        {story.coverImage ? (
                            <img src={story.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-30">
                                <span className="material-symbols-outlined text-2xl">image</span>
                                <span className="font-sans text-[9px] uppercase tracking-widest">Set Cover</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-on-surface/0 group-hover:bg-on-surface/10 transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-background opacity-0 group-hover:opacity-80 transition-opacity text-2xl drop-shadow">
                                {story.coverImage ? "edit" : "add_photo_alternate"}
                            </span>
                        </div>
                    </div>
                    {story.coverImage && (
                        <button
                            onClick={async () => {
                                const updated = await ClearStoryCoverImage(story.id) as unknown as Story;
                                onStoryChange(updated);
                            }}
                            className="w-full py-1.5 font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/50 hover:text-red-400 transition-colors"
                        >
                            Remove cover
                        </button>
                    )}
                </div>

                {/* Model + NSFW */}
                <div className="px-6 py-5 border-b border-outline/40 space-y-5">
                    <div className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant mb-3">Model</div>
                    <select
                        value={activeModel}
                        onChange={e => { setActiveModel(e.target.value); save({ activeModel: e.target.value }); }}
                        className="w-full bg-background border border-outline/50 text-on-surface font-serif text-sm px-3 py-2 outline-none focus:border-outline/60 appearance-none"
                    >
                        <option value="">Global default</option>
                        {models.map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center justify-between pt-1">
                        <span className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">NSFW</span>
                        <button
                            onClick={() => { const next = !nsfw; setNsfw(next); save({ nsfw: next }); }}
                            className={`relative w-10 h-5 transition-colors ${nsfw ? "bg-secondary" : "bg-outline/40"}`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 bg-background transition-all ${nsfw ? "left-5" : "left-0.5"}`} />
                        </button>
                    </div>
                </div>

                {/* Characters */}
                <div className="px-6 py-5 border-b border-outline/40">
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Characters</span>
                        <button onClick={addCharacter} className="text-on-surface-variant hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-base">add</span>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {characters.length === 0 && (
                            <p className="font-serif italic text-xs text-on-surface-variant/50">No characters yet.</p>
                        )}
                        {characters.map(char => (
                            <div key={char.id} className="border border-outline/40 bg-background">
                                <div
                                    className="flex items-center justify-between px-3 py-2 cursor-pointer"
                                    onClick={() => setExpandedChar(expandedChar === char.id ? null : char.id)}
                                >
                                    <span className="font-serif text-sm text-on-surface truncate">
                                        {char.name || <span className="italic text-on-surface-variant">Unnamed</span>}
                                    </span>
                                    <div className="flex items-center space-x-1 shrink-0">
                                        <button
                                            onClick={e => { e.stopPropagation(); deleteChar(char.id); }}
                                            className="text-on-surface-variant/40 hover:text-red-400 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        <span className="material-symbols-outlined text-sm text-on-surface-variant/40">
                                            {expandedChar === char.id ? "expand_less" : "expand_more"}
                                        </span>
                                    </div>
                                </div>
                                {expandedChar === char.id && (
                                    <div className="px-3 pb-3 space-y-2 border-t border-outline/25 pt-2">
                                        <input
                                            type="text"
                                            value={char.name}
                                            onChange={e => updateChar(char.id, "name", e.target.value)}
                                            onBlur={saveChars}
                                            placeholder="Name"
                                            className="w-full bg-transparent border-b border-outline/40 text-on-surface font-serif text-sm py-1 outline-none placeholder:text-on-surface-variant/40 placeholder:italic"
                                        />
                                        <textarea
                                            rows={3}
                                            value={char.description}
                                            onChange={e => updateChar(char.id, "description", e.target.value)}
                                            onBlur={saveChars}
                                            placeholder="Who are they? Role, personality, appearance…"
                                            className="w-full bg-transparent border border-outline/25 text-on-surface font-serif text-xs leading-relaxed px-2 py-1.5 resize-none outline-none placeholder:text-on-surface-variant/40 placeholder:italic"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Story Outline */}
                <div className="px-6 py-5 border-b border-outline/40 space-y-3">
                    <div className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Story Outline</div>
                    <textarea
                        rows={4}
                        value={storyOutline}
                        onChange={e => setStoryOutline(e.target.value)}
                        onBlur={() => save()}
                        placeholder="Where is this story going? Major beats, themes, tone…"
                        className="w-full bg-background border border-outline/40 focus:border-outline/50 text-on-surface font-serif text-sm leading-relaxed px-3 py-2 resize-none outline-none placeholder:text-on-surface-variant/40 placeholder:italic transition-colors"
                    />
                </div>

                {/* AI Instructions */}
                <div className="px-6 py-5 border-b border-outline/40 space-y-3">
                    <div className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">AI Instructions</div>
                    <textarea
                        rows={3}
                        value={aiInstructions}
                        onChange={e => setAiInstructions(e.target.value)}
                        onBlur={() => save()}
                        placeholder={'Override narrator behaviour for this story. E.g. "Write in a gothic tone."'}
                        className="w-full bg-background border border-outline/40 focus:border-outline/50 text-on-surface font-serif text-sm leading-relaxed px-3 py-2 resize-none outline-none placeholder:text-on-surface-variant/40 placeholder:italic transition-colors"
                    />
                </div>

                {/* Author Notes */}
                <div className="px-6 py-5 space-y-3">
                    <div className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Author Notes</div>
                    <textarea
                        rows={3}
                        value={authorNotes}
                        onChange={e => setAuthorNotes(e.target.value)}
                        onBlur={() => save()}
                        placeholder="Private context for the AI — secrets, foreshadowing, world rules."
                        className="w-full bg-background border border-outline/40 focus:border-outline/50 text-on-surface font-serif text-sm leading-relaxed px-3 py-2 resize-none outline-none placeholder:text-on-surface-variant/40 placeholder:italic transition-colors"
                    />
                </div>

            </div>
        </aside>
    );
}
