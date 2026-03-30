export default function Footer() {
    return (
        <footer className="fixed bottom-0 w-full z-40 flex justify-between items-center px-12 py-4 bg-on-surface text-background border-t border-primary font-sans uppercase text-[10px] tracking-[0.2em]">
            <div className="font-serif italic text-background lowercase tracking-normal text-sm">
                The Heritage Editorial
            </div>
            <div className="flex space-x-12">
                <a href="#" className="text-background opacity-50 hover:text-secondary transition-colors">Privacy</a>
                <a href="#" className="text-background opacity-50 hover:text-secondary transition-colors">Terms</a>
                <a href="#" className="text-background opacity-50 hover:text-secondary transition-colors">Status</a>
            </div>
            <div className="opacity-40">© MDCCCXXIV THE HERITAGE EDITORIAL</div>
        </footer>
    );
}
