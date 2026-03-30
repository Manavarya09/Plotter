"use client";
import { usePathname } from "next/navigation";
import SideNav from "./SideNav";

export default function SideNavWrapper() {
    const pathname = usePathname();
    if (pathname.startsWith("/chat")) return null;
    return <SideNav />;
}
