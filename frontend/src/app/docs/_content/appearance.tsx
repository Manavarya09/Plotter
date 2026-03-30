import Link from "next/link";
import { Tip } from "../_components/Callouts";
import type { SectionDef } from "./types";

export const appearance: SectionDef = {
    id: "appearance",
    label: "Appearance",
    icon: "palette",
    subtitle: "Shape the look and feel of your writing environment.",
    items: [
        {
            title: "Colour palettes",
            body: (
                <div className="space-y-3">
                    <p>
                        Choose from nine handcrafted colour palettes in the{" "}
                        <Link
                            href="/theme"
                            className="text-secondary border-b border-secondary/30 hover:border-secondary transition-colors"
                        >
                            Customize
                        </Link>{" "}
                        page. Each palette changes the background, surface, accent, and text colours
                        across the entire interface simultaneously.
                    </p>
                    <p>
                        A live preview card shows how the current palette and font look together before
                        you commit. Changes apply instantly.
                    </p>
                </div>
            ),
        },
        {
            title: "Typography",
            body: (
                <div className="space-y-3">
                    <p>
                        Four serif typefaces are available. Each has a distinct character suited to
                        different genres and moods:
                    </p>
                    <div className="border border-outline/30 divide-y divide-outline/20">
                        {[
                            { name: "Noto Serif", note: "Clean and neutral — a good all-rounder." },
                            {
                                name: "Playfair Display",
                                note: "High contrast and dramatic. Suits gothic or literary fiction.",
                            },
                            {
                                name: "EB Garamond",
                                note: "Old-style and elegant. Works well for historical settings.",
                            },
                            {
                                name: "Lora",
                                note: "Warm and readable. A natural choice for contemporary or cosy fiction.",
                            },
                        ].map(({ name, note }) => (
                            <div key={name} className="flex items-start space-x-4 px-5 py-4">
                                <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface-variant/60 shrink-0 w-32">
                                    {name}
                                </span>
                                <p className="text-sm italic text-on-surface-variant/70">{note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            title: "Backdrop image",
            body: (
                <div className="space-y-3">
                    <p>
                        Upload a local image to use as a full-screen backdrop behind the interface. The
                        image is loaded directly from your machine — it is never uploaded or transmitted
                        anywhere.
                    </p>
                    <p>
                        Most palettes are designed to look great without a backdrop, but a subtle
                        atmospheric image can significantly deepen immersion for the right story.
                    </p>
                    <Tip>
                        Dark, low-contrast images work best — something evocative rather than distracting.
                        A misty forest, an old map, candlelit stone.
                    </Tip>
                </div>
            ),
        },
    ],
};
