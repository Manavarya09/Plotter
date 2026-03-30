type Story = {
    title: string;
    genre: string;
    synopsis: string;
};

export default function ContextBar({ story }: { story: Story }) {
    return (
        <div className="border-b border-outline/40 px-12 py-3 flex items-center space-x-5 bg-background shrink-0">
            <span className="font-serif text-base text-on-surface">{story.title}</span>
            {story.genre && (
                <span className="font-sans text-[9px] uppercase tracking-widest text-secondary">{story.genre}</span>
            )}
            {story.synopsis && (
                <p className="font-serif italic text-sm text-on-surface-variant border-l border-outline/50 pl-5 line-clamp-1 flex-1">
                    {story.synopsis}
                </p>
            )}
        </div>
    );
}
