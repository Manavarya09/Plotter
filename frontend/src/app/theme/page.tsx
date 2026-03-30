"use client";
import { useTheme, THEMES, FONTS, ThemeId, FontId } from "@/components/ThemeProvider";
import { PickBackgroundImage } from "../../../wailsjs/go/main/App";

export default function ThemePage() {
    const { settings, setTheme, setFont, setBackground, clearBackground } = useTheme();

    const handlePickBackground = async () => {
        try {
            const dataUrl = await PickBackgroundImage();
            if (dataUrl) setBackground(dataUrl);
        } catch (e) {
            console.error("Failed to pick image:", e);
        }
    };

    return (
        <div className="h-screen">
            <main className="sidebar-main overflow-y-auto bg-background px-16 py-16 pb-20">
                <header className="mb-20 max-w-4xl border-b border-outline/40 pb-12">
                    <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary font-bold mb-6">
                        Aesthetic Configuration
                    </div>
                    <h1 className="text-7xl font-serif font-light tracking-tight text-on-surface mb-8">
                        Visual <span className="italic">Temperament</span>
                    </h1>
                    <p className="font-serif text-xl text-on-surface/70 max-w-2xl leading-relaxed italic">
                        Shape the look and feel of your writing environment. Changes apply instantly
                        and persist across sessions.
                    </p>
                </header>

                <div className="max-w-4xl grid grid-cols-12 gap-16">
                    {/* Left column */}
                    <div className="col-span-12 lg:col-span-7 space-y-16">

                        {/* Colour Palette */}
                        <section className="space-y-8">
                            <h3 className="text-xl font-serif text-on-surface uppercase tracking-widest border-b border-outline/50 pb-4">
                                Colour Palette
                            </h3>
                            <div className="space-y-3">
                                {(Object.entries(THEMES) as [ThemeId, typeof THEMES[ThemeId]][]).map(([id, theme]) => {
                                    const active = settings.themeId === id;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setTheme(id)}
                                            className={`w-full flex items-center justify-between py-5 px-6 border transition-all duration-300 ${
                                                active
                                                    ? "border-primary bg-surface"
                                                    : "border-outline/50 hover:border-outline hover:bg-surface/50"
                                            }`}
                                        >
                                            <div className="flex items-center space-x-5">
                                                {/* Swatches */}
                                                <div className="flex space-x-1">
                                                    {theme.swatches.map((color, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-5 h-5 border border-black/5"
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-serif italic text-base text-on-surface">
                                                    {theme.label}
                                                </span>
                                            </div>
                                            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                                active ? "border-primary" : "border-outline"
                                            }`}>
                                                {active && <div className="w-2 h-2 bg-primary" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Typography */}
                        <section className="space-y-8">
                            <h3 className="text-xl font-serif text-on-surface uppercase tracking-widest border-b border-outline/50 pb-4">
                                Typography
                            </h3>
                            <div className="space-y-3">
                                {(Object.entries(FONTS) as [FontId, typeof FONTS[FontId]][]).map(([id, font]) => {
                                    const active = settings.fontId === id;
                                    return (
                                        <button
                                            key={id}
                                            onClick={() => setFont(id)}
                                            className={`w-full flex items-center justify-between py-5 px-6 border transition-all duration-300 ${
                                                active
                                                    ? "border-primary bg-surface"
                                                    : "border-outline/50 hover:border-outline hover:bg-surface/50"
                                            }`}
                                        >
                                            <div className="flex flex-col items-start space-y-1">
                                                <span
                                                    className="text-xs font-sans uppercase tracking-widest text-on-surface-variant"
                                                >
                                                    {font.label}
                                                </span>
                                                <span
                                                    className="text-lg text-on-surface italic"
                                                    style={{ fontFamily: font.variable + ", serif" }}
                                                >
                                                    {font.sample}
                                                </span>
                                            </div>
                                            <div className={`w-4 h-4 border flex items-center justify-center shrink-0 ml-4 transition-colors ${
                                                active ? "border-primary" : "border-outline"
                                            }`}>
                                                {active && <div className="w-2 h-2 bg-primary" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Right column */}
                    <div className="col-span-12 lg:col-span-5 space-y-16">

                        {/* Background image */}
                        <div className="p-10 border border-outline/50 bg-surface space-y-8">
                            <h4 className="font-serif text-sm uppercase tracking-widest text-on-surface border-b border-outline/40 pb-4">
                                Backdrop Image
                            </h4>

                            {/* Preview */}
                            <div className="relative w-full aspect-video border border-outline/40 overflow-hidden bg-surface-container flex items-center justify-center">
                                {settings.background ? (
                                    <img
                                        src={settings.background}
                                        alt="Current backdrop"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center space-y-2 opacity-30">
                                        <span className="material-symbols-outlined text-3xl">image</span>
                                        <span className="font-sans text-[10px] uppercase tracking-widest">No image set</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePickBackground}
                                    className="w-full py-3 border border-primary text-primary font-serif italic text-sm hover:bg-primary hover:text-background transition-all flex items-center justify-center space-x-2"
                                >
                                    <span className="material-symbols-outlined text-sm">upload_file</span>
                                    <span>Select Image</span>
                                </button>
                                {settings.background && (
                                    <button
                                        onClick={clearBackground}
                                        className="w-full py-3 border border-outline/40 text-on-surface-variant font-serif italic text-sm hover:border-secondary hover:text-secondary transition-all"
                                    >
                                        Clear Backdrop
                                    </button>
                                )}
                            </div>

                            <p className="font-serif italic text-xs text-on-surface-variant/60 leading-relaxed">
                                The image is loaded directly from your machine and never uploaded anywhere.
                                It will be applied as a full-screen backdrop behind the interface.
                            </p>
                        </div>

                        {/* Live preview card */}
                        <div
                            className="p-8 border border-outline/50 space-y-4"
                            style={{ backgroundColor: THEMES[settings.themeId].vars["--color-surface"] }}
                        >
                            <div
                                className="text-[9px] uppercase font-sans tracking-[0.3em]"
                                style={{ color: THEMES[settings.themeId].vars["--color-secondary"] }}
                            >
                                Preview
                            </div>
                            <h3
                                className="text-2xl italic leading-snug"
                                style={{
                                    color: THEMES[settings.themeId].vars["--color-on-surface"],
                                    fontFamily: FONTS[settings.fontId].variable + ", serif",
                                }}
                            >
                                The world stirs in response to your presence.
                            </h3>
                            <p
                                className="text-sm italic leading-relaxed"
                                style={{
                                    color: THEMES[settings.themeId].vars["--color-on-surface-variant"],
                                    fontFamily: FONTS[settings.fontId].variable + ", serif",
                                }}
                            >
                                Fog rolls across the cobblestones as the lantern flickers — your next
                                move will decide everything.
                            </p>
                            <div
                                className="border-t pt-4 text-[10px] uppercase tracking-widest font-sans"
                                style={{
                                    borderColor: THEMES[settings.themeId].vars["--color-outline"],
                                    color: THEMES[settings.themeId].vars["--color-on-surface-variant"],
                                }}
                            >
                                {THEMES[settings.themeId].label} · {FONTS[settings.fontId].label}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-24" />
            </main>
        </div>
    );
}
