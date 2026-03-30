import Link from "next/link";
import { Tip, Note, InlineKey } from "../_components/Callouts";
import type { SectionDef } from "./types";

export const gettingStarted: SectionDef = {
    id: "getting-started",
    label: "Getting Started",
    icon: "rocket_launch",
    subtitle: "What Plotter is and how to run your first story.",
    items: [
        {
            title: "What is Plotter?",
            body: (
                <div className="space-y-3">
                    <p>
                        Plotter is an interactive fiction engine powered by a local AI narrator. You write
                        the actions and dialogue — the AI writes the world's response.
                    </p>
                    <p>
                        Think of it as a novel where you are the protagonist. Every action, line of
                        dialogue, or scene request you submit shapes how the story unfolds. The AI never
                        takes over your character — it only narrates the world around you.
                    </p>
                    <Tip>
                        Plotter runs entirely on your machine. No internet connection is required and no
                        data ever leaves your system.
                    </Tip>
                </div>
            ),
        },
        {
            title: "Before you begin",
            body: (
                <div className="space-y-3">
                    <p>
                        Plotter uses <strong className="text-on-surface">Ollama</strong> to run language
                        models locally. You'll need Ollama installed and running in the background before
                        the AI can generate anything.
                    </p>
                    <p>
                        Once Ollama is running, open{" "}
                        <Link
                            href="/config"
                            className="text-secondary border-b border-secondary/30 hover:border-secondary transition-colors"
                        >
                            Settings
                        </Link>{" "}
                        and download a model. The page will suggest a good starting model.
                    </p>
                    <Note>
                        If you see "no models available" in Settings, Ollama may not be running. Start it
                        from your system tray or terminal before continuing.
                    </Note>
                </div>
            ),
        },
        {
            title: "Creating your first manuscript",
            body: (
                <div className="space-y-3">
                    <p>
                        From the{" "}
                        <Link
                            href="/"
                            className="text-secondary border-b border-secondary/30 hover:border-secondary transition-colors"
                        >
                            Manuscripts
                        </Link>{" "}
                        page, press <strong className="text-on-surface">New Journey</strong> to open the
                        creation dialog.
                    </p>
                    <p>
                        Give your story a <strong className="text-on-surface">Title</strong> (required),
                        an optional <strong className="text-on-surface">Genre</strong> to help set the
                        narrator's tone, and an optional{" "}
                        <strong className="text-on-surface">Synopsis</strong> — a brief premise the AI
                        will be aware of from the start.
                    </p>
                    <p>
                        Press <InlineKey>Commence</InlineKey> and your manuscript will appear in the
                        archive. Click it to open the Chronicle and start writing.
                    </p>
                </div>
            ),
        },
    ],
};
