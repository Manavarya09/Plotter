"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GetStories, CreateStory, UpdateStoryStatus, DeleteStory } from "../../wailsjs/go/main/App";
import { BackgroundBeams } from "@/components/ui/background-beams";

type Story = {
    id: string;
    title: string;
    genre: string;
    synopsis: string;
    status: string;
    coverImage: string;
    createdAt: string;
    updatedAt: string;
};

type Filter = "active" | "complete" | "archived";

type ContextMenu = { x: number; y: number; story: Story } | null;

function formatDate(raw: any): string {
    if (!raw) return "";
    try {
        return new Date(raw).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
        });
    } catch { return ""; }
}

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (s: Story) => void }) {
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState("");
    const [synopsis, setSynopsis] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const story = await CreateStory(title.trim(), genre.trim(), synopsis.trim());
            onCreate(story as unknown as Story);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40">
            <div className="bg-background border border-outline/40 p-12 w-full max-w-xl">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h2 className="font-serif text-3xl text-on-surface">New Manuscript</h2>
                        <p className="font-serif italic text-sm text-on-surface-variant mt-2">
                            Begin a new chapter of your story.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                            placeholder="The title of your work..."
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Genre</label>
                        <input
                            value={genre}
                            onChange={e => setGenre(e.target.value)}
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30"
                            placeholder="Sci-fi, Fantasy, Literary Fiction..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Synopsis</label>
                        <textarea
                            value={synopsis}
                            onChange={e => setSynopsis(e.target.value)}
                            rows={4}
                            className="w-full bg-transparent border-b border-outline/40 focus:border-on-surface py-2 font-serif text-base text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/30 resize-none"
                            placeholder="The premise of your story..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-6 mt-12">
                    <button onClick={onClose} className="font-serif italic text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!title.trim() || loading}
                        className="px-8 py-3 bg-primary text-background font-serif text-sm tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                        {loading ? "Creating..." : "COMMENCE"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ManuscriptsPage() {
    const router = useRouter();
    const [allStories, setAllStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("active");
    const [showModal, setShowModal] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
    const contextRef = useRef<HTMLDivElement>(null);
    const [storyOrder, setStoryOrder] = useState<string[]>([]);
    const draggedId = useRef<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("plotter_story_order");
            if (saved) setStoryOrder(JSON.parse(saved));
        } catch {}
    }, []);

    useEffect(() => {
        GetStories()
            .then(data => setAllStories((data ?? []) as unknown as Story[]))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Close context menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
                setContextMenu(null);
            }
        };
        if (contextMenu) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [contextMenu]);

    const updateOrder = (newOrder: string[]) => {
        setStoryOrder(newOrder);
        try { localStorage.setItem("plotter_story_order", JSON.stringify(newOrder)); } catch {}
    };

    const sortedAllStories = useMemo(() => {
        if (storyOrder.length === 0) return allStories;
        const idx = new Map(storyOrder.map((id, i) => [id, i]));
        return [...allStories].sort((a, b) => {
            const ai = idx.has(a.id) ? idx.get(a.id)! : Infinity;
            const bi = idx.has(b.id) ? idx.get(b.id)! : Infinity;
            return ai - bi;
        });
    }, [allStories, storyOrder]);

    const handleStoryOpen = (story: Story) => {
        const newOrder = [story.id, ...storyOrder.filter(id => id !== story.id)];
        updateOrder(newOrder);
        router.push(`/chat?storyId=${story.id}`);
    };

    const handleDrop = (targetId: string) => {
        const from = draggedId.current;
        if (!from || from === targetId) return;
        const currentIds = sortedAllStories.map(s => s.id);
        const fromIdx = currentIds.indexOf(from);
        const toIdx = currentIds.indexOf(targetId);
        const newOrder = [...currentIds];
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, from);
        updateOrder(newOrder);
        draggedId.current = null;
    };

    const handleCreate = (story: Story) => {
        setAllStories(prev => [story, ...prev]);
        updateOrder([story.id, ...storyOrder]);
        setShowModal(false);
    };

    const handleContextMenu = (e: React.MouseEvent, story: Story) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, story });
    };

    const handleStatusChange = async (story: Story, status: string) => {
        setContextMenu(null);
        try {
            const updated = await UpdateStoryStatus(story.id, status) as unknown as Story;
            setAllStories(prev => prev.map(s => s.id === story.id ? updated : s));
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (story: Story) => {
        setContextMenu(null);
        try {
            await DeleteStory(story.id);
            setAllStories(prev => prev.filter(s => s.id !== story.id));
            updateOrder(storyOrder.filter(id => id !== story.id));
            try { localStorage.removeItem(`plotter_chat_${story.id}`); } catch {}
        } catch (e) { console.error(e); }
    };

    const stories = sortedAllStories.filter(s => {
        if (filter === "active") return !s.status || s.status === "active";
        return s.status === filter;
    });

    const [featured, ...rest] = stories;

    const FILTERS: { key: Filter; label: string }[] = [
        { key: "active", label: "Active" },
        { key: "complete", label: "Complete" },
        { key: "archived", label: "Archived" },
    ];

    return (
        <div className="min-h-screen" onClick={() => setContextMenu(null)}>
            <main className="sidebar-main pb-24 px-16">
                <header className="relative mb-16 border-b border-outline/50 pb-10 pt-16 overflow-hidden">
                    <BackgroundBeams className="absolute inset-0 z-0" />
                    <div className="relative z-10 flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-6xl font-serif font-light tracking-tight text-on-surface">
                                Manuscripts
                            </h1>
                            <p className="text-on-surface-variant mt-4 text-xl thin-italic">
                                A curated collection of your celestial writings.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 px-6 py-3 bg-primary text-background font-serif text-sm tracking-widest hover:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>New Journey</span>
                        </button>
                    </div>
                    <div className="relative z-10 flex space-x-8 text-xs uppercase tracking-[0.2em] font-sans">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`pb-1 transition-colors ${
                                    filter === f.key
                                        ? "border-b border-secondary text-secondary"
                                        : "text-on-surface-variant/60 hover:text-on-surface"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </header>

                {loading && (
                    <div className="flex items-center justify-center py-32">
                        <span className="font-serif italic text-on-surface-variant/60">Loading manuscripts...</span>
                    </div>
                )}

                {!loading && stories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">auto_stories</span>
                        <p className="font-serif italic text-on-surface-variant">
                            {filter === "active" ? "No active manuscripts. Begin a new journey above." : `No ${filter} manuscripts.`}
                        </p>
                    </div>
                )}

                {!loading && stories.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Featured card */}
                        <div
                            draggable
                            onDragStart={() => { draggedId.current = featured.id; }}
                            onDragOver={e => { e.preventDefault(); setDragOverId(featured.id); }}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={() => { handleDrop(featured.id); setDragOverId(null); }}
                            onClick={() => handleStoryOpen(featured)}
                            onContextMenu={e => handleContextMenu(e, featured)}
                            className={`col-span-1 md:col-span-2 group relative border bg-background subtle-shadow transition-all duration-700 overflow-hidden cursor-pointer ${dragOverId === featured.id ? "border-secondary border-2" : "border-outline/40 hover:border-secondary/30"}`}
                        >
                            <div className="flex flex-col md:flex-row h-full">
                                <div className="md:w-1/2 bg-surface flex items-center justify-center h-64 md:h-auto overflow-hidden">
                                    {featured.coverImage ? (
                                        <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-on-surface-variant/10 text-[120px]">auto_stories</span>
                                    )}
                                </div>
                                <div className="md:w-1/2 p-10 flex flex-col justify-center">
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-secondary font-sans mb-6 block">
                                        {featured.genre || "Uncategorised"}
                                    </span>
                                    <h2 className="text-4xl font-serif text-on-surface mb-4 leading-tight">
                                        {featured.title}
                                    </h2>
                                    <p className="text-on-surface-variant mb-8 thin-italic text-lg leading-relaxed">
                                        {featured.synopsis || "No synopsis yet."}
                                    </p>
                                    <div className="flex justify-between items-center border-t border-outline/40 pt-8">
                                        <div className="flex items-center space-x-3">
                                            <span className="material-symbols-outlined text-on-surface-variant text-base">history</span>
                                            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-sans">
                                                {formatDate(featured.updatedAt)}
                                            </span>
                                        </div>
                                        <button className="group-hover:translate-x-2 transition-transform duration-300">
                                            <span className="material-symbols-outlined text-on-surface text-2xl">arrow_right_alt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rest of stories */}
                        {rest.map((story) => (
                            <div
                                key={story.id}
                                draggable
                                onDragStart={() => { draggedId.current = story.id; }}
                                onDragOver={e => { e.preventDefault(); setDragOverId(story.id); }}
                                onDragLeave={() => setDragOverId(null)}
                                onDrop={() => { handleDrop(story.id); setDragOverId(null); }}
                                onClick={() => handleStoryOpen(story)}
                                onContextMenu={e => handleContextMenu(e, story)}
                                className={`group border bg-background subtle-shadow transition-all duration-500 flex flex-col cursor-pointer ${dragOverId === story.id ? "border-secondary border-2 scale-[1.01]" : "border-outline/40 hover:border-secondary/30"}`}
                            >
                                <div className="h-48 bg-surface flex items-center justify-center overflow-hidden">
                                    {story.coverImage ? (
                                        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <span className="material-symbols-outlined text-on-surface-variant/10 text-7xl group-hover:scale-110 transition-transform duration-1000">menu_book</span>
                                    )}
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <span className="text-[9px] uppercase tracking-[0.2em] text-secondary font-sans mb-2">
                                        {story.genre || "Uncategorised"}
                                    </span>
                                    <h3 className="text-2xl font-serif text-on-surface mb-3">{story.title}</h3>
                                    <p className="text-sm text-on-surface-variant thin-italic mb-8 leading-relaxed">
                                        {story.synopsis || "No synopsis yet."}
                                    </p>
                                    <div className="mt-auto flex items-center text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 font-sans">
                                        <span className="material-symbols-outlined text-sm mr-2">event</span>
                                        {formatDate(story.createdAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Context menu */}
            {contextMenu && (
                <div
                    ref={contextRef}
                    className="fixed z-50 bg-surface border border-outline/50 py-1 min-w-[160px] shadow-lg"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={e => e.stopPropagation()}
                >
                    {contextMenu.story.status !== "archived" && (
                        <button
                            onClick={() => handleStatusChange(contextMenu.story, "archived")}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-left font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">inventory_2</span>
                            <span>Archive</span>
                        </button>
                    )}
                    {contextMenu.story.status !== "complete" && (
                        <button
                            onClick={() => handleStatusChange(contextMenu.story, "complete")}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-left font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">task_alt</span>
                            <span>Mark Complete</span>
                        </button>
                    )}
                    {(contextMenu.story.status === "archived" || contextMenu.story.status === "complete") && (
                        <button
                            onClick={() => handleStatusChange(contextMenu.story, "active")}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 text-left font-sans text-xs uppercase tracking-widest text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">undo</span>
                            <span>Restore</span>
                        </button>
                    )}
                    <div className="border-t border-outline/40 my-1" />
                    <button
                        onClick={() => handleDelete(contextMenu.story)}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-left font-sans text-xs uppercase tracking-widest text-red-400/70 hover:bg-surface-container hover:text-red-400 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        <span>Delete</span>
                    </button>
                </div>
            )}

            {showModal && (
                <CreateModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
            )}
        </div>
    );
}
