"use client";
import { useState } from "react";
import SaveTemplateModal from "./SaveTemplateModal";

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
    messagesEmpty: boolean;
    saveState: "idle" | "saving" | "saved" | "error";
    saveError: string;
    onSave: () => void;
    onNewSession: () => void;
};

export default function RightPanel({ story, messagesEmpty, saveState, saveError, onSave, onNewSession }: Props) {
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    return (
        <>
            <div className="fixed right-0 top-0 h-screen w-14 bg-surface border-l border-outline/40 flex flex-col items-center pt-8 pb-8 z-40 space-y-6">
                {/* Save session */}
                <button
                    onClick={onSave}
                    disabled={messagesEmpty || saveState === "saving"}
                    title="Save session as chapter"
                    className="flex flex-col items-center space-y-1 group disabled:opacity-30 transition-opacity"
                >
                    <span className={`material-symbols-outlined text-xl transition-colors ${
                        saveState === "saved" ? "text-primary"
                        : saveState === "error" ? "text-red-400"
                        : saveState === "saving" ? "text-on-surface-variant animate-pulse"
                        : "text-on-surface-variant group-hover:text-on-surface"
                    }`}>
                        {saveState === "saved" ? "check" : saveState === "error" ? "error" : "save"}
                    </span>
                    <span className={`font-sans text-[8px] uppercase tracking-widest ${
                        saveState === "error" ? "text-red-400/80" : "text-on-surface-variant/60"
                    }`}>
                        {saveState === "saved" ? "Saved" : saveState === "saving" ? "..." : saveState === "error" ? "Failed" : "Save"}
                    </span>
                </button>

                {/* New session */}
                <button
                    onClick={onNewSession}
                    disabled={messagesEmpty}
                    title="Start new session"
                    className="flex flex-col items-center space-y-1 group disabled:opacity-30 transition-opacity"
                >
                    <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-on-surface transition-colors">
                        restart_alt
                    </span>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-on-surface-variant/60">New</span>
                </button>

                {/* Save as template */}
                <button
                    onClick={() => setShowTemplateModal(true)}
                    title="Save story as template"
                    className="flex flex-col items-center space-y-1 group transition-opacity"
                >
                    <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-on-surface transition-colors">
                        bookmark_add
                    </span>
                    <span className="font-sans text-[8px] uppercase tracking-widest text-on-surface-variant/60">Template</span>
                </button>

                {saveState === "error" && saveError && (
                    <div className="fixed right-16 top-8 bg-surface border border-red-400/30 px-3 py-2 max-w-xs z-50">
                        <p className="font-sans text-[9px] text-red-400 leading-relaxed">{saveError}</p>
                    </div>
                )}
            </div>

            {showTemplateModal && (
                <SaveTemplateModal
                    story={story}
                    onClose={() => setShowTemplateModal(false)}
                    onSaved={() => setShowTemplateModal(false)}
                />
            )}
        </>
    );
}
