"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StorySettingsPanel from "@/components/StorySettingsPanel";
import { GetStory, StreamMessage, SaveSession, GenerateImage } from "../../../wailsjs/go/main/App";
import { EventsOn } from "../../../wailsjs/runtime/runtime";
import ContextBar from "./_components/ContextBar";
import ChatInput from "./_components/ChatInput";
import MessageList, { type Message } from "./_components/MessageList";
import RightPanel from "./_components/RightPanel";

type Story = {
    id: string;
    title: string;
    genre: string;
    synopsis: string;
    activeModel: string;
    nsfw: boolean;
    aiInstructions: string;
    authorNotes: string;
    storyOutline: string;
    characters: { id: string; name: string; description: string }[];
    coverImage: string;
    status: string;
};

type Mode = "act" | "speak" | "see";

function ChatContent() {
    const searchParams = useSearchParams();
    const storyId = searchParams.get("storyId") ?? "";

    const [story, setStory] = useState<Story | null>(null);
    const [storyError, setStoryError] = useState(false);
    const [mode, setMode] = useState<Mode>("act");
    const [input, setInput] = useState("");
    const lsKey = storyId ? `plotter_chat_${storyId}` : null;
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoaded, setMessagesLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [panelWidth, setPanelWidth] = useState(288);
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [saveError, setSaveError] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [generatingImgId, setGeneratingImgId] = useState<number | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});

    const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const narratorIdRef = useRef<number | null>(null);
    const hasOpenedRef = useRef(false);

    useEffect(() => {
        if (!storyId) return;
        GetStory(storyId)
            .then(s => setStory(s as unknown as Story))
            .catch(() => setStoryError(true));
    }, [storyId]);

    // Load persisted messages after mount
    useEffect(() => {
        if (!lsKey) { setMessagesLoaded(true); return; }
        try {
            const raw = localStorage.getItem(lsKey);
            if (raw) setMessages(JSON.parse(raw));
        } catch {}
        setMessagesLoaded(true);
    }, [lsKey]);

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (!lsKey || !messagesLoaded) return;
        try { localStorage.setItem(lsKey, JSON.stringify(messages)); } catch {}
    }, [messages, lsKey, messagesLoaded]);

    // Auto-generate opening scene on first visit
    useEffect(() => {
        if (!story || !messagesLoaded || hasOpenedRef.current) return;
        hasOpenedRef.current = true;
        if (messages.length > 0) return;

        const narratorId = Date.now();
        narratorIdRef.current = narratorId;
        setMessages([{ id: narratorId, role: "narrator", content: "" }]);
        setLoading(true);
        setElapsed(0);
        elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        StreamMessage(story.id, [], "", "act");
    }, [story, messagesLoaded]);

    const stopTimer = () => {
        if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null; }
    };

    useEffect(() => {
        const offToken = EventsOn("chat:token", (token: string) => {
            const id = narratorIdRef.current;
            if (id == null) return;
            setMessages(prev => prev.map(m =>
                m.id === id ? { ...m, content: m.content + token } : m
            ));
        });
        const offDone = EventsOn("chat:done", () => {
            narratorIdRef.current = null;
            setLoading(false);
            stopTimer();
        });
        const offError = EventsOn("chat:error", (err: string) => {
            const id = narratorIdRef.current;
            narratorIdRef.current = null;
            setLoading(false);
            stopTimer();
            setMessages(prev => prev.map(m =>
                m.id === id ? { ...m, content: "The narrator falls silent. " + err } : m
            ));
        });
        return () => { offToken(); offDone(); offError(); };
    }, []);

    const handleSend = () => {
        const text = input.trim();
        if (!text || loading || !story) return;

        if (mode === "see") {
            const playerMsg: Message = { id: Date.now(), role: "player", mode: "see", content: text };
            const imageId = Date.now() + 1;
            setMessages(prev => [...prev, playerMsg, { id: imageId, role: "narrator", content: "", imageUrl: undefined }]);
            setInput("");
            setLoading(true);
            setElapsed(0);
            elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
            GenerateImage(story.id, text)
                .then(img => {
                    stopTimer();
                    setLoading(false);
                    setMessages(prev => prev.map(m => m.id === imageId ? { ...m, imageUrl: img, content: text } : m));
                })
                .catch(e => {
                    stopTimer();
                    setLoading(false);
                    setMessages(prev => prev.map(m => m.id === imageId ? { ...m, content: "Image generation failed. " + (e?.message ?? String(e)) } : m));
                });
            return;
        }

        const playerMsg: Message = { id: Date.now(), role: "player", mode, content: text };
        const narratorId = Date.now() + 1;
        narratorIdRef.current = narratorId;

        const history = [...messages, playerMsg].map(m => ({
            role: m.role,
            mode: m.mode ?? "",
            content: m.content,
        }));

        setMessages(prev => [...prev, playerMsg, { id: narratorId, role: "narrator", content: "" }]);
        setInput("");
        setLoading(true);
        setElapsed(0);
        elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        StreamMessage(story.id, history, text, mode);
    };

    const handleSaveSession = async () => {
        if (!story || messages.length === 0 || saveState === "saving") return;
        setSaveState("saving");
        try {
            const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            const content = messages
                .filter(m => m.content.trim())
                .map(m => {
                    const label = m.role === "narrator" ? "Narrator" : m.mode === "speak" ? "You (speaking)" : "You (acting)";
                    return `${label}:\n${m.content.trim()}`;
                })
                .join("\n\n---\n\n");
            await SaveSession(story.id, `Session — ${date}`, content);
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            setSaveError(msg);
            setSaveState("error");
            setTimeout(() => { setSaveState("idle"); setSaveError(""); }, 5000);
        }
    };

    const handleGenerateImage = async (msg: Message) => {
        if (!story || generatingImgId !== null) return;
        setGeneratingImgId(msg.id);
        try {
            const img = await GenerateImage(story.id, msg.content);
            setGeneratedImages(prev => ({ ...prev, [msg.id]: img }));
        } catch (e: any) {
            console.error("Image generation failed:", e);
        } finally {
            setGeneratingImgId(null);
        }
    };

    const handleRegenerate = () => {
        if (loading || !story) return;
        const lastNarrIdx = [...messages].map((m, i) => ({ m, i })).filter(({ m }) => m.role === "narrator").slice(-1)[0]?.i;
        if (lastNarrIdx == null) return;
        const history = messages.slice(0, lastNarrIdx).map(m => ({ role: m.role, mode: m.mode ?? "", content: m.content }));
        const narratorId = Date.now();
        narratorIdRef.current = narratorId;
        setMessages(prev => [...prev.slice(0, lastNarrIdx), { id: narratorId, role: "narrator" as const, content: "" }]);
        setLoading(true);
        setElapsed(0);
        elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        StreamMessage(story.id, history, "", "act");
    };

    const handleEditConfirm = (msg: Message) => {
        if (!editText.trim() || !story) return;
        const idx = messages.findIndex(m => m.id === msg.id);
        if (idx === -1) return;
        const updated = { ...msg, content: editText.trim() };
        const trimmed = messages.slice(0, idx + 1).map(m => m.id === msg.id ? updated : m);
        const history = trimmed.map(m => ({ role: m.role, mode: m.mode ?? "", content: m.content }));
        const narratorId = Date.now();
        narratorIdRef.current = narratorId;
        setMessages([...trimmed, { id: narratorId, role: "narrator" as const, content: "" }]);
        setEditingId(null);
        setEditText("");
        setLoading(true);
        setElapsed(0);
        elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
        StreamMessage(story.id, history, editText.trim(), msg.mode ?? "act");
    };

    if (!storyId) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center space-y-4 opacity-40">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">auto_stories</span>
                    <p className="font-serif italic text-lg text-on-surface-variant">Select a manuscript to begin.</p>
                </div>
            </div>
        );
    }

    if (storyError) {
        return (
            <div className="flex h-screen items-center justify-center opacity-40">
                <p className="font-serif italic text-on-surface-variant">Could not load story.</p>
            </div>
        );
    }

    return (
        <div className="flex overflow-hidden h-screen">
            {story && (
                <StorySettingsPanel
                    story={story}
                    onStoryChange={s => setStory(s as unknown as Story)}
                    onWidthChange={setPanelWidth}
                />
            )}

            {story && (
                <RightPanel
                    story={story}
                    messagesEmpty={messages.length === 0}
                    saveState={saveState}
                    saveError={saveError}
                    onSave={handleSaveSession}
                    onNewSession={() => {
                        if (lsKey) localStorage.removeItem(lsKey);
                        setMessages([]);
                        hasOpenedRef.current = false;
                    }}
                />
            )}

            <div
                className="flex-1 flex flex-col overflow-hidden transition-none"
                style={{ marginLeft: story ? panelWidth : 0, marginRight: story ? 56 : 0 }}
            >
                {story && <ContextBar story={story} />}

                {story && (
                    <main className="flex-1 flex flex-col relative max-w-3xl mx-auto w-full px-8 pb-48 overflow-hidden">
                        <MessageList
                            messages={messages}
                            loading={loading}
                            elapsed={elapsed}
                            editingId={editingId}
                            editText={editText}
                            generatingImgId={generatingImgId}
                            generatedImages={generatedImages}
                            onEditStart={msg => { setEditingId(msg.id); setEditText(msg.content); }}
                            onEditTextChange={setEditText}
                            onEditConfirm={handleEditConfirm}
                            onEditCancel={() => { setEditingId(null); setEditText(""); }}
                            onRegenerate={handleRegenerate}
                            onGenerateImage={handleGenerateImage}
                        />
                        <ChatInput
                            mode={mode}
                            input={input}
                            loading={loading}
                            onModeChange={setMode}
                            onInputChange={setInput}
                            onSend={handleSend}
                        />
                    </main>
                )}
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <span className="font-serif italic text-on-surface-variant/40">Loading...</span>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
