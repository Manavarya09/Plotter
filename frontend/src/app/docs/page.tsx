"use client";
import { useState, useEffect } from "react";
import { SECTIONS } from "./_content";
import { SectionBlock } from "./_components/Accordion";

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState("getting-started");

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: "-15% 0px -75% 0px" }
        );
        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="sidebar-main flex min-h-screen">

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0 px-10 xl:px-16 pt-20 pb-40">
                <header className="mb-20 border-b border-outline/40 pb-12 max-w-2xl">
                    <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary font-bold mb-6">
                        User Guide
                    </div>
                    <h1 className="text-6xl font-serif font-light tracking-tight text-on-surface mb-6">
                        The <span className="italic">Plotter</span> Guide
                    </h1>
                    <p className="font-serif text-lg text-on-surface/60 leading-relaxed italic">
                        Everything you need to craft stories, configure your narrator, and shape the world
                        around you.
                    </p>
                </header>

                <div className="space-y-24 max-w-2xl">
                    {SECTIONS.map((section) => (
                        <SectionBlock key={section.id} section={section} />
                    ))}
                </div>

                <div className="max-w-2xl mt-24 pt-12 border-t border-outline/25">
                    <p className="font-serif italic text-sm text-on-surface-variant/30 text-center">
                        That's everything. Now go write something remarkable.
                    </p>
                </div>
            </main>

            {/* ── On this page box ── */}
            <aside className="hidden lg:block w-60 shrink-0 pt-20 px-6">
                <div className="sticky top-24 border border-outline/30 bg-surface">
                    <div className="px-5 pt-5 pb-4 border-b border-outline/25">
                        <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-on-surface-variant/40">
                            On this page
                        </span>
                    </div>
                    <div className="py-3">
                        {SECTIONS.map((s) => {
                            const active = activeSection === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => scrollToSection(s.id)}
                                    className={`w-full flex items-center space-x-3 py-2.5 pl-4 pr-5 text-left transition-all duration-150 border-l-2 ${
                                        active
                                            ? "border-secondary text-on-surface"
                                            : "border-transparent text-on-surface-variant/40 hover:text-on-surface hover:border-outline/40"
                                    }`}
                                >
                                    <span
                                        className={`material-symbols-outlined text-sm shrink-0 ${
                                            active ? "text-secondary" : ""
                                        }`}
                                    >
                                        {s.icon}
                                    </span>
                                    <span className={`font-serif text-sm ${active ? "italic" : ""}`}>
                                        {s.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

        </div>
    );
}
