"use client";
import { useState } from "react";
import { CreateUserTemplate } from "../../../../wailsjs/go/main/App";

type Story = {
    genre: string;
    synopsis: string;
    aiInstructions: string;
    authorNotes: string;
    storyOutline: string;
    nsfw: boolean;
    characters: { id: string; name: string; description: string }[];
};

type Props = {
    story: Story;
    onClose: () => void;
    onSaved: () => void;
};

const ICON_OPTIONS = [
    "auto_stories", "book", "edit_note", "create", "ink_pen",
    "rocket", "public", "forest", "castle", "travel_explore",
    "psychology", "favorite", "skull", "bolt", "star",
];

export default function SaveTemplateModal({ story, onClose, onSaved }: Props) {
    const [name, setName] = useState("");
    const [tagline, setTagline] = useState("");
    const [description, setDescription] = useState("");
    const [moodInput, setMoodInput] = useState("");
    const [moods, setMoods] = useState<string[]>([]);
    const [icon, setIcon] = useState("auto_stories");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const addMood = () => {
        const m = moodInput.trim().toLowerCase();
        if (m && !moods.includes(m)) setMoods(prev => [...prev, m]);
        setMoodInput("");
    };

    const removeMood = (m: string) => setMoods(prev => prev.filter(x => x !== m));

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        setError("");
        try {
            await CreateUserTemplate(
                name.trim(),
                story.genre,
                tagline.trim(),
                description.trim(),
                JSON.stringify(moods),
                icon,
                story.nsfw,
                story.synopsis,
                story.aiInstructions,
                story.authorNotes,
                story.storyOutline,
                JSON.stringify(story.characters),
            );
            onSaved();
        } catch (e: any) {
            setError(e?.message ?? "Something went wrong.");
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40"
            onClick={onClose}
        >
            <div
                className="bg-background border border-outline/40 p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="font-sans text-[9px] uppercase tracking-[0.25em] text-secondary mb-2">Save as Template</div>
                        <h2 className="font-serif text-2xl text-on-surface italic">Preserve this world</h2>
                        <p className="font-serif text-sm text-on-surface-variant/60 italic mt-1">
                            All story settings will be captured. Give it a name to find it later.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Template name */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                            Template name <span className="text-red-400">*</span>
                        </label>
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. The Gothic Manor, Space Horror…"
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                        />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Tagline</label>
                        <input
                            value={tagline}
                            onChange={e => setTagline(e.target.value)}
                            placeholder="A short evocative line…"
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What kind of story does this template enable?"
                            rows={3}
                            className="w-full bg-transparent border border-outline/30 focus:border-on-surface/50 p-3 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none"
                        />
                    </div>

                    {/* Moods */}
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Mood tags</label>
                        <div className="flex gap-2">
                            <input
                                value={moodInput}
                                onChange={e => setMoodInput(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addMood(); } }}
                                placeholder="e.g. dread, romance…"
                                className="flex-1 bg-transparent border-b border-outline/40 focus:border-on-surface py-1.5 font-serif text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                            />
                            <button
                                onClick={addMood}
                                className="font-sans text-[9px] uppercase tracking-widest text-secondary hover:text-on-surface transition-colors px-2"
                            >
                                Add
                            </button>
                        </div>
                        {moods.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {moods.map(m => (
                                    <span key={m} className="flex items-center gap-1 font-sans text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/50 border border-outline/30 px-2 py-0.5">
                                        {m}
                                        <button onClick={() => removeMood(m)} className="text-on-surface-variant/40 hover:text-on-surface transition-colors">
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
                                <button
                                    key={ic}
                                    onClick={() => setIcon(ic)}
                                    className={`w-9 h-9 flex items-center justify-center border transition-all ${icon === ic ? "border-primary/60 bg-surface text-primary" : "border-outline/30 text-on-surface-variant/40 hover:border-outline/60"}`}
                                >
                                    <span className="material-symbols-outlined text-lg">{ic}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* What's captured */}
                    <div className="border border-outline/30 bg-surface px-4 py-3 space-y-2">
                        <p className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/40">Captured from this story</p>
                        <div className="space-y-1">
                            {[
                                { icon: "description", label: "Synopsis" },
                                { icon: "tune", label: "AI instructions" },
                                { icon: "visibility_off", label: "Author notes" },
                                { icon: "route", label: "Story outline" },
                                ...(story.characters.length > 0
                                    ? [{ icon: "group", label: `${story.characters.length} character${story.characters.length > 1 ? "s" : ""}` }]
                                    : []),
                            ].map(({ icon: ic, label }) => (
                                <div key={label} className="flex items-center space-x-2">
                                    <span className="material-symbols-outlined text-sm text-primary/40">{ic}</span>
                                    <span className="font-serif text-xs text-on-surface-variant/60 italic">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <p className="font-serif text-xs italic text-red-400">{error}</p>}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={onClose}
                        className="font-serif italic text-sm text-on-surface-variant/50 hover:text-on-surface transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || loading}
                        className="px-8 py-3 bg-primary text-background font-serif text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        {loading ? "Saving…" : "SAVE TEMPLATE"}
                    </button>
                </div>
            </div>
        </div>
    );
}
