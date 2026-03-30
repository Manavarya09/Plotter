
const presets = ["Ethereal", "Cinematic", "Documentary"];

const variations = [
    { id: 1, label: "01 / Celestial Drift", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCrh-_xkTekhPW4CMbIyPzzpxtB_L8zQHJD7j1KLBYjy9UdWkpahNATKX041ehmM16vDjEbZ2sV9HkK4SEzG2NmjVdiLvUWz2w1zxcW7QOC5raJqYgaptQrfU9wDj65wbq0IX81mjU0kQRpkK1NCuZbw71LyiCyyXD9Bbka1EL7CscpdoWbI5aGu8ygpSpEncNFX8LV_nM8FzmVmjdlyegxC-1lHkItAjtXzDLLGpU8AFKaWegibn-itGNtj2QY0xw-XaOGruebCL7G" },
    { id: 2, label: "02 / Reflective Hull", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSwRw7gib5-Zsj9MA4kzuT-l1uZCAcc7b2Yt-MJyrKkwKUU9yq9znayRwSVMbt6uPNStglPFVLOVyOzERLv05H56HBy9WDbGR4ick7o47iXnN3jPQtLowHOiSsfec_q2M7CdQfxmRC1HJZN3loO-2uyw9uHYCakYRD0F94CSNSEAjg5cpfmBgnplmSYMNPG9sP-mVBEdqWGxFdDsoJGqFy0e0Keii8YO2jo8GxRVoD_N8EIi52TTLWFJlc7aveINDMlchN3bqJfbNm" },
    { id: 3, label: "03 / Kinetic Ghosting", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoTNtoLWVR1du7uL-QabQF5jskap1pD5TibJlPfngIem6u0eIKbkMJbfeXkjavVkUtaYelkilFTvYGavY9RRKv-mdQwmzSDqEI8esEIDyxlfRXmmY28K88IvKr85zz_GN-i4vGADFH_DHQPa4km1OQMxRxDdCwn51LVWuX0X6qLm_NaUqkHS3T2EQKLlr1-aZBupBf5nVtXp2HyYYCCh-zqJlaIItcJzGhEUua2FhkDnh6FTBlwnvFdIa-9n4oJEPXsPZUO9xovnb2" },
    { id: 4, label: "04 / Spectral Edge", src: "" },
];

export default function VisualsPage() {
    return (
        <div className="h-screen pt-[88px]">
            <main className="sidebar-main relative flex flex-col items-center justify-center p-8 overflow-hidden bg-background" style={{height: "calc(100vh - 88px)"}}>
                {/* Subtle narrative background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-10 px-24">
                    <div>
                        <h1 className="font-serif text-4xl italic mb-8 text-on-surface">
                            Chapter IV: The Echoing Void
                        </h1>
                        <p className="text-lg leading-relaxed italic">
                            The starship drifted silently past the nebula's edge, its hull reflecting a spectrum of
                            impossible colors. Inside the bridge, Elara watched as the particles of light danced like
                            ghosts against the viewport...
                        </p>
                    </div>
                </div>

                {/* Studio panel */}
                <div className="relative z-10 w-full max-w-6xl h-full max-h-[800px] flex flex-col bg-surface border border-outline/40">
                    {/* Panel header */}
                    <div className="px-8 py-6 flex items-center justify-between border-b border-outline/40">
                        <div>
                            <h2 className="font-serif text-xl italic tracking-tight text-on-surface">
                                Visual Manifestation
                            </h2>
                            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-on-surface-variant mt-1 opacity-70">
                                Studio Phase // Nebula Sequence IV
                            </p>
                        </div>
                        <button className="p-2 hover:bg-surface-container transition-colors">
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left controls */}
                        <div className="w-72 border-r border-outline/40 bg-surface/50 p-8 flex flex-col space-y-10 overflow-y-auto">
                            <div className="space-y-6">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                                    Atmospheric Preset
                                </label>
                                <div className="space-y-2">
                                    {presets.map((preset, i) => (
                                        <button
                                            key={preset}
                                            className={`w-full px-4 py-3 flex items-center justify-between font-serif italic text-sm transition-all ${
                                                i === 0
                                                    ? "border border-primary text-primary"
                                                    : "border border-outline/50 text-on-surface-variant hover:border-primary/50"
                                            }`}
                                        >
                                            <span>{preset}</span>
                                            <span className="material-symbols-outlined text-base">
                                                {i === 0 ? "radio_button_checked" : "radio_button_unchecked"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                                    Composition
                                </label>
                                <div className="space-y-4">
                                    {[
                                        { label: "Aspect Ratio", value: "16:9" },
                                        { label: "Optical Detail", value: "High Precision" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center border-b border-outline/25 pb-2">
                                            <span className="font-serif italic text-xs">{label}</span>
                                            <span className="font-sans text-[11px] font-bold">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="p-5 border border-secondary/20 bg-secondary/5">
                                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-secondary font-bold block mb-2 italic">
                                        Editorial Note
                                    </span>
                                    <p className="font-serif italic text-[11px] leading-relaxed text-on-surface-variant">
                                        Reference: Elara's spectral reaction (p.2). Adjust light sensitivity to reflect kinetic ghosting.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 bg-white/30 p-10 flex flex-col space-y-10 overflow-y-auto">
                            {/* Command bar */}
                            <div className="flex items-center border-b border-primary/20 pb-4">
                                <textarea
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 font-serif italic text-lg resize-none h-14 outline-none"
                                    placeholder="Command the visual manifestation..."
                                />
                                <button className="ml-6 px-10 py-3 bg-primary text-background font-serif italic text-sm hover:opacity-90 transition-opacity">
                                    Process
                                </button>
                            </div>

                            {/* Gallery */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">
                                        Selected Variations
                                    </h3>
                                    <span className="font-sans text-[10px] tracking-widest uppercase opacity-40">
                                        Proof 01 — 04
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    {variations.map((v) => (
                                        <div
                                            key={v.id}
                                            className="group relative aspect-video cursor-pointer border border-outline/25 hover:border-outline/40 transition-all overflow-hidden bg-surface"
                                        >
                                            {v.src ? (
                                                <img
                                                    src={v.src}
                                                    alt={v.label}
                                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-on-surface-variant/20 text-4xl">
                                                        image
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="font-serif italic text-[10px] text-white bg-primary/80 px-2 py-1">
                                                    {v.label}
                                                </span>
                                                <button className="text-white">
                                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
