"use client";
import { useState } from "react";
import type { SectionDef } from "../_content/types";

function AccordionItem({
    title,
    body,
    open,
    onToggle,
}: {
    title: string;
    body: React.ReactNode;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-outline/25">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-5 text-left group"
            >
                <span
                    className={`font-serif text-base transition-colors duration-150 ${
                        open
                            ? "italic text-on-surface"
                            : "text-on-surface/70 group-hover:text-on-surface"
                    }`}
                >
                    {title}
                </span>
                <span
                    className={`material-symbols-outlined text-sm text-on-surface-variant/30 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                    }`}
                >
                    expand_more
                </span>
            </button>
            {open && (
                <div className="pb-8 pr-2 space-y-3 font-serif text-sm text-on-surface-variant leading-relaxed">
                    {body}
                </div>
            )}
        </div>
    );
}

export function SectionBlock({
    section,
}: {
    section: SectionDef;
}) {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

    const toggle = (idx: number) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    return (
        <section id={section.id} style={{ scrollMarginTop: "5rem" }}>
            <div className="flex items-start space-x-4 mb-8">
                <span className="material-symbols-outlined text-secondary/50 text-xl mt-1.5 shrink-0">
                    {section.icon}
                </span>
                <div>
                    <h2 className="text-2xl font-serif text-on-surface">{section.label}</h2>
                    <p className="font-serif italic text-sm text-on-surface-variant/60 mt-1">
                        {section.subtitle}
                    </p>
                </div>
            </div>
            <div className="border-t border-outline/30">
                {section.items.map((item, idx) => (
                    <AccordionItem
                        key={idx}
                        title={item.title}
                        body={item.body}
                        open={openItems.has(idx)}
                        onToggle={() => toggle(idx)}
                    />
                ))}
            </div>
        </section>
    );
}
