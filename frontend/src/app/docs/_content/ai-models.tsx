import Link from "next/link";
import { Tip, Note } from "../_components/Callouts";
import type { SectionDef } from "./types";

export const aiModels: SectionDef = {
    id: "ai-models",
    label: "AI Models",
    icon: "memory",
    subtitle: "Download and manage the local models that power the narrator.",
    items: [
        {
            title: "What is Ollama?",
            body: (
                <div className="space-y-3">
                    <p>
                        Ollama is a tool that runs large language models locally on your machine. Plotter
                        connects to it to generate the narrator's responses. Everything stays on your
                        device — there's no cloud, no API key, and no subscription.
                    </p>
                    <p>
                        You need Ollama installed and running before Plotter can generate text. Once
                        installed, Ollama runs silently in the background.
                    </p>
                </div>
            ),
        },
        {
            title: "Downloading a model",
            body: (
                <div className="space-y-3">
                    <p>
                        Go to{" "}
                        <Link
                            href="/config"
                            className="text-secondary border-b border-secondary/30 hover:border-secondary transition-colors"
                        >
                            Settings
                        </Link>{" "}
                        and type a model name into the download field, then press pull. Download progress
                        is shown in real-time with a progress bar and estimated completion.
                    </p>
                    <p>
                        The Settings page lists a recommended starting model. Larger models (13B
                        parameters and above) need more GPU memory but produce significantly better prose
                        — worth the wait if your hardware supports it.
                    </p>
                    <Note>
                        Model downloads range from a few hundred megabytes to over 20 GB. Make sure you
                        have sufficient disk space before pulling a large model.
                    </Note>
                </div>
            ),
        },
        {
            title: "Global model configuration",
            body: (
                <div className="space-y-3">
                    <p>
                        In Settings, each downloaded model has a set of configuration fields that apply
                        globally — across all stories that use that model:
                    </p>
                    <div className="border border-outline/30 divide-y divide-outline/20">
                        <div className="px-5 py-4 space-y-1">
                            <p className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">
                                AI Instructions
                            </p>
                            <p className="text-sm">
                                Override the narrator's default behaviour and writing style. E.g.{" "}
                                <span className="italic opacity-60">
                                    "Always write in a gothic, atmospheric style with short sentences."
                                </span>
                            </p>
                        </div>
                        <div className="px-5 py-4 space-y-1">
                            <p className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">
                                Story Instructions
                            </p>
                            <p className="text-sm">
                                Additional narrative direction layered on top of the per-story settings.
                                Useful for rules you want applied to every story you write.
                            </p>
                        </div>
                        <div className="px-5 py-4 space-y-1">
                            <p className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant">
                                Author Notes
                            </p>
                            <p className="text-sm">
                                Global background context that applies to any story using this model.
                            </p>
                        </div>
                    </div>
                    <Tip>
                        Per-story settings in the Chronicle panel are layered on top of these global
                        model settings. The story-level context always takes precedence where they
                        conflict.
                    </Tip>
                </div>
            ),
        },
        {
            title: "Deleting a model",
            body: (
                <p>
                    In Settings, each downloaded model has a delete button. Removing a model frees up the
                    disk space it occupied. You can re-download it at any time from the same Settings
                    page.
                </p>
            ),
        },
    ],
};
