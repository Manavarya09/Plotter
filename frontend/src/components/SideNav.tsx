"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { label: "Manuscripts", icon: "auto_stories", href: "/" },
    { label: "Templates", icon: "bookmarks", href: "/templates" },
    { label: "Customize", icon: "palette", href: "/theme" },
    { label: "Guide", icon: "help", href: "/docs" },
];

export default function SideNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(true);

    const applySidebarWidth = (isCollapsed: boolean) => {
        document.documentElement.style.setProperty("--sidebar-w", isCollapsed ? "3.5rem" : "14rem");
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem("plotter_sidenav_collapsed");
            const isCollapsed = saved !== null ? saved === "true" : true;
            setCollapsed(isCollapsed);
            applySidebarWidth(isCollapsed);
        } catch {}
    }, []);

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        applySidebarWidth(next);
        try { localStorage.setItem("plotter_sidenav_collapsed", String(next)); } catch {}
    };

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-surface border-r border-outline/40 flex flex-col py-10 z-40 transition-all duration-300 overflow-hidden ${collapsed ? "w-14 px-2" : "w-56 px-5"}`}
        >
            <button
                onClick={toggle}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={`absolute top-4 right-2 p-1 text-on-surface opacity-30 hover:opacity-70 transition-opacity`}
            >
                <span className="material-symbols-outlined text-base">
                    {collapsed ? "chevron_right" : "chevron_left"}
                </span>
            </button>

            <div className="space-y-1 flex-1 mt-8">
                {navItems.map(({ label, icon, href }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={collapsed ? label : undefined}
                            className={`flex items-center p-3 transition-all active:translate-x-1 font-serif text-sm tracking-wide ${collapsed ? "justify-center" : "space-x-3"} ${
                                active
                                    ? "text-on-surface font-bold italic bg-surface-container"
                                    : "text-on-surface opacity-60 hover:bg-surface-container hover:opacity-100"
                            }`}
                        >
                            <span className="material-symbols-outlined shrink-0">{icon}</span>
                            {!collapsed && <span className="truncate">{label}</span>}
                        </Link>
                    );
                })}
            </div>

            <div className={`mt-8 border-t border-outline/40 pt-6 space-y-1`}>
                <button
                    onClick={() => router.push("/config")}
                    title={collapsed ? "Settings" : undefined}
                    className={`flex items-center w-full p-3 transition-all font-serif text-sm tracking-wide ${collapsed ? "justify-center" : "space-x-3"} ${
                        pathname === "/config"
                            ? "text-on-surface font-bold italic bg-surface-container"
                            : "text-on-surface opacity-60 hover:bg-surface-container hover:opacity-100"
                    }`}
                >
                    <span className="material-symbols-outlined shrink-0">settings</span>
                    {!collapsed && <span>Settings</span>}
                </button>

            </div>
        </aside>
    );
}
