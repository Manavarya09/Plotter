export function Tip({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start space-x-3 px-5 py-4 bg-surface border-l-2 border-primary/40 my-3">
            <span className="material-symbols-outlined text-sm text-primary/50 shrink-0 mt-0.5">lightbulb</span>
            <p className="font-serif text-sm text-on-surface-variant/80 leading-relaxed italic">{children}</p>
        </div>
    );
}

export function Note({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start space-x-3 px-5 py-4 bg-surface-container border-l-2 border-secondary/40 my-3">
            <span className="material-symbols-outlined text-sm text-secondary/50 shrink-0 mt-0.5">info</span>
            <p className="font-serif text-sm text-on-surface-variant/80 leading-relaxed">{children}</p>
        </div>
    );
}

export function InlineKey({ children }: { children: React.ReactNode }) {
    return (
        <span className="font-sans text-[10px] uppercase tracking-widest text-on-surface border border-outline/60 px-2 py-0.5 mx-0.5">
            {children}
        </span>
    );
}
