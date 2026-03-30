export type SectionDef = {
    id: string;
    label: string;
    icon: string;
    subtitle: string;
    items: { title: string; body: React.ReactNode }[];
};
