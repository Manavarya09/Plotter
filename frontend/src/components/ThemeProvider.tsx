"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { GetBackground, ClearBackground } from "@/lib/wails";

export type ThemeId = "heritage" | "midnight" | "ivory" | "slate" | "obsidian" | "forest" | "deepsea" | "ember" | "abyss";
export type FontId = "noto-serif" | "playfair" | "garamond" | "lora";

export type ThemeSettings = {
    themeId: ThemeId;
    fontId: FontId;
    background: string; // base64 data URL or ""
};

type ThemeVars = {
    "--color-background": string;
    "--color-surface": string;
    "--color-surface-container": string;
    "--color-primary": string;
    "--color-secondary": string;
    "--color-on-surface": string;
    "--color-on-surface-variant": string;
    "--color-outline": string;
};

export const THEMES: Record<ThemeId, { label: string; vars: ThemeVars; swatches: string[] }> = {
    heritage: {
        label: "Heritage",
        swatches: ["#fcf9f0", "#1b3022", "#984446", "#061b0e"],
        vars: {
            "--color-background": "#fcf9f0",
            "--color-surface": "#f6f3ea",
            "--color-surface-container": "#e5e2da",
            "--color-primary": "#1b3022",
            "--color-secondary": "#984446",
            "--color-on-surface": "#061b0e",
            "--color-on-surface-variant": "#4a544e",
            "--color-outline": "#d1cdbc",
        },
    },
    midnight: {
        label: "Midnight",
        swatches: ["#0f0e0c", "#1a1917", "#c9a96e", "#f5f0e8"],
        vars: {
            "--color-background": "#0f0e0c",
            "--color-surface": "#1a1917",
            "--color-surface-container": "#252320",
            "--color-primary": "#c9a96e",
            "--color-secondary": "#8b3a3a",
            "--color-on-surface": "#f5f0e8",
            "--color-on-surface-variant": "#a09888",
            "--color-outline": "#3a3830",
        },
    },
    ivory: {
        label: "Ivory",
        swatches: ["#fffff8", "#f8f8f0", "#2c2c2c", "#7a6a50"],
        vars: {
            "--color-background": "#fffff8",
            "--color-surface": "#f8f8f0",
            "--color-surface-container": "#efefea",
            "--color-primary": "#2c2c2c",
            "--color-secondary": "#7a6a50",
            "--color-on-surface": "#1a1a1a",
            "--color-on-surface-variant": "#5a5a52",
            "--color-outline": "#d8d8cc",
        },
    },
    slate: {
        label: "Slate",
        swatches: ["#f4f4f2", "#eceae6", "#1e2d3d", "#5c7a6e"],
        vars: {
            "--color-background": "#f4f4f2",
            "--color-surface": "#eceae6",
            "--color-surface-container": "#e0ded8",
            "--color-primary": "#1e2d3d",
            "--color-secondary": "#5c7a6e",
            "--color-on-surface": "#0f1923",
            "--color-on-surface-variant": "#4a5560",
            "--color-outline": "#c8c6c0",
        },
    },
    obsidian: {
        label: "Obsidian",
        swatches: ["#0c0c10", "#141418", "#7eb8d4", "#9b8bb4"],
        vars: {
            "--color-background": "#0c0c10",
            "--color-surface": "#141418",
            "--color-surface-container": "#1e1e26",
            "--color-primary": "#7eb8d4",
            "--color-secondary": "#9b8bb4",
            "--color-on-surface": "#e8e8f2",
            "--color-on-surface-variant": "#8888a4",
            "--color-outline": "#2c2c3a",
        },
    },
    forest: {
        label: "Forest Night",
        swatches: ["#090e0a", "#111a12", "#4db87a", "#8bc4a0"],
        vars: {
            "--color-background": "#090e0a",
            "--color-surface": "#111a12",
            "--color-surface-container": "#182319",
            "--color-primary": "#4db87a",
            "--color-secondary": "#8bc4a0",
            "--color-on-surface": "#dff0e8",
            "--color-on-surface-variant": "#7a9a88",
            "--color-outline": "#1e3323",
        },
    },
    deepsea: {
        label: "Deep Sea",
        swatches: ["#080c14", "#0f1520", "#4a9bc4", "#7ab8d8"],
        vars: {
            "--color-background": "#080c14",
            "--color-surface": "#0f1520",
            "--color-surface-container": "#172030",
            "--color-primary": "#4a9bc4",
            "--color-secondary": "#7ab8d8",
            "--color-on-surface": "#d8e8f4",
            "--color-on-surface-variant": "#6888a4",
            "--color-outline": "#1e2d42",
        },
    },
    ember: {
        label: "Ember",
        swatches: ["#100c08", "#1a1410", "#d4834a", "#b86040"],
        vars: {
            "--color-background": "#100c08",
            "--color-surface": "#1a1410",
            "--color-surface-container": "#241c16",
            "--color-primary": "#d4834a",
            "--color-secondary": "#b86040",
            "--color-on-surface": "#f0e8d8",
            "--color-on-surface-variant": "#a08870",
            "--color-outline": "#342820",
        },
    },
    abyss: {
        label: "Abyss",
        swatches: ["#0a080f", "#14111a", "#9b6ed4", "#c49ae0"],
        vars: {
            "--color-background": "#0a080f",
            "--color-surface": "#14111a",
            "--color-surface-container": "#1e1a28",
            "--color-primary": "#9b6ed4",
            "--color-secondary": "#c49ae0",
            "--color-on-surface": "#ece8f8",
            "--color-on-surface-variant": "#9090b8",
            "--color-outline": "#2a2440",
        },
    },
};

export const FONTS: Record<FontId, { label: string; variable: string; sample: string }> = {
    "noto-serif": {
        label: "Noto Serif",
        variable: "var(--font-noto-serif)",
        sample: "The stars whisper ancient secrets.",
    },
    playfair: {
        label: "Playfair Display",
        variable: "var(--font-playfair)",
        sample: "The stars whisper ancient secrets.",
    },
    garamond: {
        label: "EB Garamond",
        variable: "var(--font-garamond)",
        sample: "The stars whisper ancient secrets.",
    },
    lora: {
        label: "Lora",
        variable: "var(--font-lora)",
        sample: "The stars whisper ancient secrets.",
    },
};

const STORAGE_KEY = "plotter-theme";

const defaults: ThemeSettings = {
    themeId: "heritage",
    fontId: "noto-serif",
    background: "",
};

type ThemeContextValue = {
    settings: ThemeSettings;
    setTheme: (id: ThemeId) => void;
    setFont: (id: FontId) => void;
    setBackground: (dataUrl: string) => void;
    clearBackground: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
}

function applyTheme(settings: ThemeSettings) {
    const root = document.documentElement;
    const vars = THEMES[settings.themeId].vars;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty("--font-serif", FONTS[settings.fontId].variable + ", serif");
    if (settings.background) {
        document.body.style.backgroundImage = `url(${settings.background})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
    } else {
        document.body.style.backgroundImage = "";
    }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<ThemeSettings>(defaults);

    useEffect(() => {
        // Restore theme + font from localStorage (tiny — just two strings)
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Omit<ThemeSettings, "background">;
                setSettings(s => ({ ...s, ...parsed }));
                applyTheme({ ...defaults, ...parsed });
            }
        } catch {}

        // Restore background from Go backend (file on disk, no quota limit)
        GetBackground().then(dataUrl => {
            if (dataUrl) {
                setSettings(s => {
                    const next = { ...s, background: dataUrl };
                    applyTheme(next);
                    return next;
                });
            }
        }).catch(() => {});
    }, []);

    const savePrefs = (next: ThemeSettings) => {
        setSettings(next);
        applyTheme(next);
        // Only persist theme + font to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ themeId: next.themeId, fontId: next.fontId }));
    };

    return (
        <ThemeContext.Provider value={{
            settings,
            setTheme: (id) => savePrefs({ ...settings, themeId: id }),
            setFont: (id) => savePrefs({ ...settings, fontId: id }),
            setBackground: (dataUrl) => {
                // Background already saved to disk by PickBackgroundImage on the Go side
                const next = { ...settings, background: dataUrl };
                setSettings(next);
                applyTheme(next);
            },
            clearBackground: () => {
                ClearBackground();
                const next = { ...settings, background: "" };
                setSettings(next);
                applyTheme(next);
            },
        }}>
            {children}
        </ThemeContext.Provider>
    );
}
