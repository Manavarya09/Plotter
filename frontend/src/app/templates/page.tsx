"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateStory, UpdateStorySettings, GetUserTemplates, CreateUserTemplate, DeleteUserTemplate } from "@/lib/wails";
import { TEMPLATES, type Template } from "./_content/templates";

type UserTemplate = {
    id: string;
    name: string;
    genre: string;
    tagline: string;
    description: string;
    moods: string[];
    icon: string;
    nsfw: boolean;
    synopsis: string;
    aiInstructions: string;
    authorNotes: string;
    storyOutline: string;
    characters: { id: string; name: string; description: string }[];
};

// ─── Mood tag ──────────────────────────────────────────────────────────────

function MoodTag({ label }: { label: string }) {
    return (
        <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/50 border border-outline/30 px-2 py-0.5">
            {label}
        </span>
    );
}

// ─── Built-in template card ─────────────────────────────────────────────────

function TemplateCard({
    template,
    onSelect,
}: {
    template: Template;
    onSelect: (t: Template) => void;
}) {
    return (
        <div className="group border border-outline/40 bg-background hover:border-secondary/40 transition-all duration-500 flex flex-col subtle-shadow">
            {/* Card header — icon area */}
            <div className="bg-surface-container flex items-center justify-center h-28 border-b border-outline/30 relative overflow-hidden">
                <span className="material-symbols-outlined text-on-surface-variant/10 text-[80px] group-hover:scale-110 transition-transform duration-700">
                    {template.icon}
                </span>
                <div className="absolute top-3 left-4 flex items-center space-x-2">
                    <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-secondary/70">
                        {template.genre}
                    </span>
                    {template.nsfw && (
                        <span className="font-sans text-[8px] uppercase tracking-widest text-red-400/60 border border-red-400/30 px-1.5 py-0.5">
                            18+
                        </span>
                    )}
                </div>
            </div>

            {/* Card body */}
            <div className="p-7 flex flex-col flex-1">
                <h3 className="font-serif text-xl italic text-on-surface leading-tight mb-2">
                    {template.name}
                </h3>
                <p className="font-serif text-xs text-secondary/70 italic mb-4 leading-relaxed">
                    {template.tagline}
                </p>
                <p className="font-serif text-sm text-on-surface-variant/70 leading-relaxed mb-6 flex-1">
                    {template.description}
                </p>

                {/* Mood tags */}
                <div className="flex flex-wrap gap-1.5 mb-7">
                    {template.moods.map((m) => (
                        <MoodTag key={m} label={m} />
                    ))}
                </div>

                {/* Characters preview */}
                {template.characters.length > 0 && (
                    <div className="mb-7 space-y-1">
                        <p className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/30 mb-2">
                            Characters
                        </p>
                        {template.characters.slice(0, 2).map((c) => (
                            <div key={c.id} className="flex items-center space-x-2">
                                <span className="material-symbols-outlined text-xs text-on-surface-variant/30">
                                    person
                                </span>
                                <span className="font-serif text-xs text-on-surface-variant/50 italic truncate">
                                    {c.name}
                                </span>
                            </div>
                        ))}
                        {template.characters.length > 2 && (
                            <p className="font-serif text-[10px] italic text-on-surface-variant/30 pl-5">
                                +{template.characters.length - 2} more
                            </p>
                        )}
                    </div>
                )}

                {/* CTA */}
                <button
                    onClick={() => onSelect(template)}
                    className="w-full flex items-center justify-between px-5 py-3 border border-primary/50 text-primary font-serif italic text-sm hover:bg-primary hover:text-background transition-all duration-300 group/btn"
                >
                    <span>Begin this story</span>
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                        arrow_forward
                    </span>
                </button>
            </div>
        </div>
    );
}

// ─── User template card ─────────────────────────────────────────────────────

function UserTemplateCard({
    template,
    onSelect,
    onDelete,
}: {
    template: UserTemplate;
    onSelect: (t: UserTemplate) => void;
    onDelete: (id: string) => void;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div className="group border border-outline/40 bg-background hover:border-secondary/40 transition-all duration-500 flex flex-col subtle-shadow">
            {/* Card header */}
            <div className="bg-surface-container flex items-center justify-center h-28 border-b border-outline/30 relative overflow-hidden">
                <span className="material-symbols-outlined text-on-surface-variant/10 text-[80px] group-hover:scale-110 transition-transform duration-700">
                    {template.icon || "auto_stories"}
                </span>
                <div className="absolute top-3 left-4 flex items-center space-x-2">
                    <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-secondary/70">
                        {template.genre}
                    </span>
                    {template.nsfw && (
                        <span className="font-sans text-[8px] uppercase tracking-widest text-red-400/60 border border-red-400/30 px-1.5 py-0.5">
                            18+
                        </span>
                    )}
                </div>
                {/* My Template badge */}
                <div className="absolute top-3 right-4">
                    <span className="font-sans text-[8px] uppercase tracking-widest text-primary/60 border border-primary/30 px-1.5 py-0.5">
                        Mine
                    </span>
                </div>
                {/* Delete button */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {confirmDelete ? (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onDelete(template.id)}
                                className="font-sans text-[8px] uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
                            >
                                Delete
                            </button>
                            <span className="text-on-surface-variant/30 text-[8px]">·</span>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="font-sans text-[8px] uppercase tracking-widest text-on-surface-variant/50 hover:text-on-surface transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="text-on-surface-variant/30 hover:text-red-400 transition-colors"
                            title="Delete template"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Card body */}
            <div className="p-7 flex flex-col flex-1">
                <h3 className="font-serif text-xl italic text-on-surface leading-tight mb-2">
                    {template.name}
                </h3>
                {template.tagline && (
                    <p className="font-serif text-xs text-secondary/70 italic mb-4 leading-relaxed">
                        {template.tagline}
                    </p>
                )}
                {template.description ? (
                    <p className="font-serif text-sm text-on-surface-variant/70 leading-relaxed mb-6 flex-1">
                        {template.description}
                    </p>
                ) : (
                    <div className="flex-1 mb-6" />
                )}

                {/* Mood tags */}
                {template.moods.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-7">
                        {template.moods.map((m) => (
                            <MoodTag key={m} label={m} />
                        ))}
                    </div>
                )}

                {/* Characters preview */}
                {template.characters.length > 0 && (
                    <div className="mb-7 space-y-1">
                        <p className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/30 mb-2">
                            Characters
                        </p>
                        {template.characters.slice(0, 2).map((c) => (
                            <div key={c.id} className="flex items-center space-x-2">
                                <span className="material-symbols-outlined text-xs text-on-surface-variant/30">person</span>
                                <span className="font-serif text-xs text-on-surface-variant/50 italic truncate">{c.name}</span>
                            </div>
                        ))}
                        {template.characters.length > 2 && (
                            <p className="font-serif text-[10px] italic text-on-surface-variant/30 pl-5">
                                +{template.characters.length - 2} more
                            </p>
                        )}
                    </div>
                )}

                <button
                    onClick={() => onSelect(template)}
                    className="w-full flex items-center justify-between px-5 py-3 border border-primary/50 text-primary font-serif italic text-sm hover:bg-primary hover:text-background transition-all duration-300 group/btn"
                >
                    <span>Begin this story</span>
                    <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">
                        arrow_forward
                    </span>
                </button>
            </div>
        </div>
    );
}

// ─── Create story modal (built-in templates) ────────────────────────────────

function CreateModal({
    template,
    onClose,
}: {
    template: Template;
    onClose: () => void;
}) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!title.trim()) return;
        setLoading(true);
        setError("");
        try {
            const story = await CreateStory(title.trim(), template.genre, template.synopsis) as any;
            await UpdateStorySettings(
                story.id, "", template.nsfw, template.aiInstructions,
                template.authorNotes, template.storyOutline, JSON.stringify(template.characters)
            );
            router.push(`/chat?storyId=${story.id}`);
        } catch (e) {
            console.error(e);
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40" onClick={onClose}>
            <div className="bg-background border border-outline/40 p-12 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="font-sans text-[9px] uppercase tracking-[0.25em] text-secondary mb-2">{template.genre}</div>
                        <h2 className="font-serif text-2xl text-on-surface italic">{template.name}</h2>
                        <p className="font-serif text-sm text-on-surface-variant/60 italic mt-1">{template.tagline}</p>
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="border border-outline/30 bg-surface px-5 py-4 mb-8 space-y-3">
                    <p className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/40">What's included</p>
                    <div className="space-y-1.5">
                        {[
                            { icon: "description", label: "Opening synopsis" },
                            { icon: "tune", label: "Story instructions" },
                            { icon: "visibility_off", label: "Author notes" },
                            ...(template.characters.length > 0
                                ? [{ icon: "group", label: `${template.characters.length} pre-built character${template.characters.length > 1 ? "s" : ""}` }]
                                : []),
                            { icon: "route", label: "Story outline" },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center space-x-2.5">
                                <span className="material-symbols-outlined text-sm text-primary/40">{icon}</span>
                                <span className="font-serif text-xs text-on-surface-variant/60 italic">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Give it a title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCreate()}
                        autoFocus
                        placeholder="The title of your story…"
                        className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                    />
                    {error && <p className="font-serif text-xs italic text-red-400">{error}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={onClose} className="font-serif italic text-sm text-on-surface-variant/50 hover:text-on-surface transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!title.trim() || loading}
                        className="px-8 py-3 bg-primary text-background font-serif text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        {loading ? "Creating…" : "COMMENCE"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Create story modal (user templates) ────────────────────────────────────

function UserCreateModal({
    template,
    onClose,
}: {
    template: UserTemplate;
    onClose: () => void;
}) {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        if (!title.trim()) return;
        setLoading(true);
        setError("");
        try {
            const story = await CreateStory(title.trim(), template.genre, template.synopsis) as any;
            await UpdateStorySettings(
                story.id, "", template.nsfw, template.aiInstructions,
                template.authorNotes, template.storyOutline, JSON.stringify(template.characters)
            );
            router.push(`/chat?storyId=${story.id}`);
        } catch (e) {
            console.error(e);
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40" onClick={onClose}>
            <div className="bg-background border border-outline/40 p-12 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="font-sans text-[9px] uppercase tracking-[0.25em] text-secondary mb-2">{template.genre}</div>
                        <h2 className="font-serif text-2xl text-on-surface italic">{template.name}</h2>
                        {template.tagline && (
                            <p className="font-serif text-sm text-on-surface-variant/60 italic mt-1">{template.tagline}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="border border-outline/30 bg-surface px-5 py-4 mb-8 space-y-3">
                    <p className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/40">What's included</p>
                    <div className="space-y-1.5">
                        {[
                            { icon: "description", label: "Opening synopsis" },
                            { icon: "tune", label: "AI instructions" },
                            { icon: "visibility_off", label: "Author notes" },
                            ...(template.characters.length > 0
                                ? [{ icon: "group", label: `${template.characters.length} character${template.characters.length > 1 ? "s" : ""}` }]
                                : []),
                            { icon: "route", label: "Story outline" },
                        ].map(({ icon, label }) => (
                            <div key={label} className="flex items-center space-x-2.5">
                                <span className="material-symbols-outlined text-sm text-primary/40">{icon}</span>
                                <span className="font-serif text-xs text-on-surface-variant/60 italic">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Give it a title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCreate()}
                        autoFocus
                        placeholder="The title of your story…"
                        className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                    />
                    {error && <p className="font-serif text-xs italic text-red-400">{error}</p>}
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={onClose} className="font-serif italic text-sm text-on-surface-variant/50 hover:text-on-surface transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!title.trim() || loading}
                        className="px-8 py-3 bg-primary text-background font-serif text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        {loading ? "Creating…" : "COMMENCE"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Create user template from scratch modal ────────────────────────────────

const ICON_OPTIONS = [
    "auto_stories", "book", "edit_note", "create", "ink_pen",
    "rocket", "public", "forest", "castle", "travel_explore",
    "psychology", "favorite", "skull", "bolt", "star",
];

function CreateUserTemplateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [name, setName] = useState("");
    const [genre, setGenre] = useState("");
    const [tagline, setTagline] = useState("");
    const [description, setDescription] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [moodInput, setMoodInput] = useState("");
    const [moods, setMoods] = useState<string[]>([]);
    const [icon, setIcon] = useState("auto_stories");
    const [nsfw, setNsfw] = useState(false);
    const [aiInstructions, setAiInstructions] = useState("");
    const [authorNotes, setAuthorNotes] = useState("");
    const [storyOutline, setStoryOutline] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const addMood = () => {
        const m = moodInput.trim().toLowerCase();
        if (m && !moods.includes(m)) setMoods(prev => [...prev, m]);
        setMoodInput("");
    };

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        try {
            await CreateUserTemplate(
                name.trim(), genre.trim(), tagline.trim(), description.trim(),
                JSON.stringify(moods), icon, nsfw,
                synopsis.trim(), aiInstructions.trim(), authorNotes.trim(), storyOutline.trim(),
                "[]"
            );
            onCreated();
        } catch (e: any) {
            setError(e?.message ?? "Something went wrong.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40" onClick={onClose}>
            <div className="bg-background border border-outline/40 p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="font-sans text-[9px] uppercase tracking-[0.25em] text-secondary mb-2">New Template</div>
                        <h2 className="font-serif text-2xl text-on-surface italic">Build from scratch</h2>
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                            Template name <span className="text-red-400">*</span>
                        </label>
                        <input autoFocus value={name} onChange={e => setName(e.target.value)}
                            placeholder="e.g. The Gothic Manor…"
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30" />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Genre</label>
                        <input value={genre} onChange={e => setGenre(e.target.value)}
                            placeholder="e.g. Horror, Romance, Sci-Fi…"
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30" />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Tagline</label>
                        <input value={tagline} onChange={e => setTagline(e.target.value)}
                            placeholder="A short evocative line…"
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="What kind of story does this template enable?"
                            rows={2}
                            className="w-full bg-transparent border border-outline/30 focus:border-on-surface/50 p-3 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none" />
                    </div>

                    {/* Synopsis */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Opening synopsis</label>
                        <textarea value={synopsis} onChange={e => setSynopsis(e.target.value)}
                            placeholder="The opening situation the player wakes up to…"
                            rows={3}
                            className="w-full bg-transparent border border-outline/30 focus:border-on-surface/50 p-3 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none" />
                    </div>

                    {/* AI Instructions */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">AI instructions</label>
                        <textarea value={aiInstructions} onChange={e => setAiInstructions(e.target.value)}
                            placeholder="How should the AI write? Tone, style, rules…"
                            rows={2}
                            className="w-full bg-transparent border border-outline/30 focus:border-on-surface/50 p-3 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none" />
                    </div>

                    {/* Author Notes */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Author notes</label>
                        <textarea value={authorNotes} onChange={e => setAuthorNotes(e.target.value)}
                            placeholder="Hidden context — secrets, lore, foreshadowing…"
                            rows={2}
                            className="w-full bg-transparent border border-outline/30 focus:border-on-surface/50 p-3 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none" />
                    </div>

                    {/* Story Outline */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Story outline</label>
                        <textarea value={storyOutline} onChange={e => setStoryOutline(e.target.value)}
                            placeholder="Act 1: …&#10;Act 2: …&#10;Act 3: …"
                            rows={3}
                            className="w-full bg-transparent border border-outline/30 focus:border-on-surface/50 p-3 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none" />
                    </div>

                    {/* Moods */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Mood tags</label>
                        <div className="flex gap-2">
                            <input value={moodInput} onChange={e => setMoodInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMood(); } }}
                                placeholder="e.g. dread, romance…"
                                className="flex-1 bg-transparent border-b border-outline/40 focus:border-on-surface py-1.5 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30" />
                            <button onClick={addMood} className="font-sans text-[9px] uppercase tracking-widest text-secondary hover:text-on-surface transition-colors px-2">Add</button>
                        </div>
                        {moods.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {moods.map(m => (
                                    <span key={m} className="flex items-center gap-1 font-sans text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/50 border border-outline/30 px-2 py-0.5">
                                        {m}
                                        <button onClick={() => setMoods(prev => prev.filter(x => x !== m))} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
                                            <span className="material-symbols-outlined text-[10px]">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICON_OPTIONS.map(ic => (
                                <button key={ic} onClick={() => setIcon(ic)}
                                    className={`w-9 h-9 flex items-center justify-center border transition-all ${icon === ic ? "border-primary/60 bg-surface text-primary" : "border-outline/30 text-on-surface-variant/40 hover:border-outline/60"}`}>
                                    <span className="material-symbols-outlined text-lg">{ic}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* NSFW */}
                    <div className="flex items-center justify-between">
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Adult content (18+)</span>
                        <button
                            onClick={() => setNsfw(v => !v)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${nsfw ? "bg-primary" : "bg-outline/40"}`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-all ${nsfw ? "left-5" : "left-0.5"}`} />
                        </button>
                    </div>

                    {error && <p className="font-serif text-xs italic text-red-400">{error}</p>}
                </div>

                <div className="flex items-center justify-between mt-8">
                    <button onClick={onClose} className="font-serif italic text-sm text-on-surface-variant/50 hover:text-on-surface transition-colors">Cancel</button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || loading}
                        className="px-8 py-3 bg-primary text-background font-serif text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        {loading ? "Creating…" : "CREATE TEMPLATE"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────────

type Tab = "built-in" | "mine";

export default function TemplatesPage() {
    const [tab, setTab] = useState<Tab>("built-in");
    const [selected, setSelected] = useState<Template | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserTemplate | null>(null);
    const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const loadUserTemplates = () => {
        GetUserTemplates()
            .then(ts => setUserTemplates((ts as unknown as UserTemplate[]) ?? []))
            .catch(() => setUserTemplates([]));
    };

    useEffect(() => {
        loadUserTemplates();
    }, []);

    const handleDelete = async (id: string) => {
        await DeleteUserTemplate(id).catch(() => {});
        loadUserTemplates();
    };

    return (
        <div className="min-h-screen">
            <main className="sidebar-main px-16 pb-32">
                {/* Header */}
                <header className="mb-16 border-b border-outline/50 pb-10 pt-16">
                    <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary font-bold mb-6">
                        Story Templates
                    </div>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h1 className="text-6xl font-serif font-light tracking-tight text-on-surface mb-4">
                                Begin with a <span className="italic">world</span>
                            </h1>
                            <p className="font-serif text-xl text-on-surface/60 italic max-w-2xl leading-relaxed">
                                Each template comes pre-configured with a synopsis, narrative instructions,
                                author notes, characters, and a story outline. All of it is yours to edit.
                            </p>
                        </div>
                        {tab === "mine" && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="shrink-0 flex items-center gap-2 px-6 py-3 border border-primary/50 text-primary font-serif italic text-sm hover:bg-primary hover:text-background transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                New template
                            </button>
                        )}
                        {tab === "built-in" && (
                            <div className="shrink-0 text-right">
                                <span className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/30">
                                    {TEMPLATES.length} templates
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-8">
                        {(["built-in", "mine"] as Tab[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex flex-col items-center gap-1 transition-opacity ${tab === t ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                            >
                                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-on-surface">
                                    {t === "built-in" ? "Built-in" : `My Templates${userTemplates.length > 0 ? ` (${userTemplates.length})` : ""}`}
                                </span>
                                <div className={`h-[1px] bg-primary transition-all duration-300 ${tab === t ? "w-full" : "w-0"}`} />
                            </button>
                        ))}
                    </div>
                </header>

                {/* Built-in templates grid */}
                {tab === "built-in" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {TEMPLATES.map((t) => (
                            <TemplateCard key={t.id} template={t} onSelect={setSelected} />
                        ))}
                    </div>
                )}

                {/* My Templates grid */}
                {tab === "mine" && (
                    <>
                        {userTemplates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6 opacity-40">
                                <span className="material-symbols-outlined text-5xl text-on-surface-variant">bookmark</span>
                                <div className="text-center space-y-2">
                                    <p className="font-serif italic text-lg text-on-surface-variant">No templates yet.</p>
                                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                                        Save a story as a template, or create one from scratch.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {userTemplates.map(t => (
                                    <UserTemplateCard
                                        key={t.id}
                                        template={t}
                                        onSelect={setSelectedUser}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {selected && (
                <CreateModal template={selected} onClose={() => setSelected(null)} />
            )}

            {selectedUser && (
                <UserCreateModal template={selectedUser} onClose={() => setSelectedUser(null)} />
            )}

            {showCreateModal && (
                <CreateUserTemplateModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); loadUserTemplates(); }}
                />
            )}
        </div>
    );
}
