import Link from "next/link";
import { Tip, Note } from "../_components/Callouts";
import type { SectionDef } from "./types";

export const storyConfig: SectionDef = {
    id: "story-config",
    label: "Story Configuration",
    icon: "tune",
    subtitle: "Shape the narrator's understanding of your characters and world.",
    items: [
        {
            title: "Opening the settings panel",
            body: (
                <p>
                    In the Chronicle, click the panel icon on the right edge of the screen to open the
                    Story Settings panel. This panel is unique to each manuscript and all changes are
                    saved automatically.
                </p>
            ),
        },
        {
            title: "Characters",
            body: (
                <div className="space-y-3">
                    <p>
                        Add the key characters in your story — give each a name and a brief description
                        of who they are, their personality, and their role in the narrative. The narrator
                        uses this to keep characterisations consistent across the whole session.
                    </p>
                    <Tip>
                        You don't need to list every minor character. Focus on the ones who appear
                        frequently or whose behaviour needs to stay consistent.
                    </Tip>
                </div>
            ),
        },
        {
            title: "Story Instructions",
            body: (
                <div className="space-y-3">
                    <p>
                        Direction specific to this story's arc. Use this to guide the narrative toward
                        your intended tone, plot trajectory, or world rules. A few examples:
                    </p>
                    <ul className="space-y-1 ml-4 italic text-on-surface-variant/60 list-none">
                        <li>"The protagonist is searching for a lost sibling in a city under occupation."</li>
                        <li>"This is a slow-burn thriller — keep tension present but never break it."</li>
                        <li>"The world is low-fantasy. No overt magic or supernatural elements."</li>
                    </ul>
                </div>
            ),
        },
        {
            title: "Author Notes",
            body: (
                <div className="space-y-3">
                    <p>
                        Private context the AI uses but <em>never surfaces</em> directly in its
                        narration. Ideal for backstory, plot secrets, world-building rules, or character
                        history that should influence events without being spoken aloud.
                    </p>
                    <Note>
                        Think of Author Notes as the director's notes behind the scenes — the narrator
                        reads them and lets them shape the world, but never quotes them to you.
                    </Note>
                </div>
            ),
        },
        {
            title: "Story Outline",
            body: (
                <div className="space-y-3">
                    <p>
                        An optional arc map for your story. Write a loose outline of where you want
                        things to go — act breaks, turning points, a planned ending — and the narrator
                        will keep it in mind as it shapes events.
                    </p>
                    <p>
                        Especially useful for longer stories where you want to stay on track without
                        micro-managing every scene.
                    </p>
                </div>
            ),
        },
        {
            title: "Active Model",
            body: (
                <div className="space-y-3">
                    <p>
                        Choose which AI model narrates this story. Different models have different writing
                        styles, context window sizes, and performance profiles. You can download models
                        from the{" "}
                        <Link
                            href="/config"
                            className="text-secondary border-b border-secondary/30 hover:border-secondary transition-colors"
                        >
                            Settings page
                        </Link>
                        .
                    </p>
                    <Tip>
                        Larger models generally produce richer prose but respond more slowly. Start with
                        a smaller model to test your setup before committing to a long session.
                    </Tip>
                </div>
            ),
        },
        {
            title: "NSFW toggle",
            body: (
                <div className="space-y-3">
                    <p>
                        Enables mature content in the narrator's responses. This flag is passed directly
                        to the model — how faithfully it's honoured depends on the model's training.
                    </p>
                    <Note>
                        Some models are fine-tuned to respect this flag precisely. Others may require
                        additional context in your AI Instructions to produce the right tone.
                    </Note>
                </div>
            ),
        },
    ],
};
