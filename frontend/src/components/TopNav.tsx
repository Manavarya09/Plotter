"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
    { label: "Archive", href: "/" },
    { label: "Chronicle", href: "/chat" },
];

export default function TopNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-12 py-6 bg-background border-b border-outline/30">
            <div className="font-serif font-bold text-2xl tracking-tighter text-on-surface">
                The Heritage AI
            </div>
            <div className="flex items-center space-x-12">
                {links.map(({ label, href }) => {
                    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`font-serif italic text-lg tracking-tight transition-opacity duration-300 ${
                                active
                                    ? "text-secondary border-b border-secondary pb-1 opacity-100"
                                    : "text-on-surface opacity-70 hover:opacity-100"
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>
            <div className="flex items-center space-x-6">
                <button
                    onClick={() => router.push("/config")}
                    className={`text-on-surface transition-opacity active:scale-95 ${pathname === "/config" ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
                    title="Neural Configuration"
                >
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <button className="text-on-surface hover:opacity-60 transition-opacity active:scale-95">
                    <span className="material-symbols-outlined">account_circle</span>
                </button>
            </div>
        </nav>
    );
}
