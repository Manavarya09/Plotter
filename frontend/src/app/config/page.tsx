"use client";
import { useState, useEffect } from "react";
import {
    GetOllamaModels,
    GetActiveModel,
    SetActiveModel,
    PullModel,
    DeleteModel,
    GetModelConfig,
    SaveModelConfig,
    CheckComfyUI,
    GetComfyConfig,
    GetComfyModels,
    SaveComfyConfig,
    BrowseWorkflowFile,
    EventsOn,
} from "@/lib/wails";
import { main } from "../../../wailsjs/go/models";

type PullProgress = { status: string; total: number; completed: number; percent: number };
type PullState = { active: boolean; progress: PullProgress | null; error: string | null };
type ModelCfg = { aiInstructions: string; storyInstructions: string; authorNotes: string };

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const gb = bytes / 1024 / 1024 / 1024;
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
}

const FIELD_META: { key: keyof ModelCfg; label: string; hint: string }[] = [
    {
        key: "aiInstructions",
        label: "AI Instructions",
        hint: "Override the narrator's default behaviour. E.g. \"Always write in a gothic tone\" or \"Keep the world grounded and realistic.\"",
    },
    {
        key: "storyInstructions",
        label: "Story Instructions",
        hint: "Direction for this specific story arc. E.g. \"The protagonist is searching for a lost sibling\" or \"Build tension slowly.\"",
    },
    {
        key: "authorNotes",
        label: "Author Notes",
        hint: "Private context the AI uses but never mentions to the player. Character backgrounds, world rules, plot secrets.",
    },
];

function ModelConfigFields({ model }: { model: string }) {
    const [cfg, setCfg] = useState<ModelCfg>({ aiInstructions: "", storyInstructions: "", authorNotes: "" });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        GetModelConfig(model).then(c => {
            if (c) setCfg({ aiInstructions: c.aiInstructions ?? "", storyInstructions: c.storyInstructions ?? "", authorNotes: c.authorNotes ?? "" });
        });
    }, [model]);

    const handleBlur = async () => {
        await SaveModelConfig(model, cfg.aiInstructions, cfg.storyInstructions, cfg.authorNotes);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    return (
        <div className="mt-6 space-y-8 border-t border-outline/25 pt-6">
            {FIELD_META.map(({ key, label, hint }) => (
                <div key={key} className="space-y-3">
                    <div className="flex justify-between items-baseline">
                        <label className="font-sans text-[9px] uppercase tracking-[0.25em] text-on-surface-variant">
                            {label}
                        </label>
                        {saved && key === "authorNotes" && (
                            <span className="font-serif italic text-[10px] text-primary/60">Saved</span>
                        )}
                    </div>
                    <textarea
                        rows={3}
                        value={cfg[key]}
                        onChange={e => setCfg(prev => ({ ...prev, [key]: e.target.value }))}
                        onBlur={handleBlur}
                        placeholder={hint}
                        className="w-full bg-surface border border-outline/40 focus:border-outline/50 text-on-surface font-serif text-sm leading-relaxed px-4 py-3 resize-none outline-none placeholder:text-on-surface-variant/40 placeholder:italic transition-colors"
                    />
                </div>
            ))}
        </div>
    );
}

type ComfyCfg = { url: string; model: string; steps: number; cfg: number; width: number; height: number; negativePrompt: string; workflowPath: string; positiveNodeID: string };

const SIZE_PRESETS = [512, 640, 768, 1024];

function ComfySection() {
    const [connected, setConnected] = useState<boolean | null>(null);
    const [cfg, setCfg] = useState<ComfyCfg>({ url: "http://127.0.0.1:8000", model: "", steps: 20, cfg: 7, width: 512, height: 768, negativePrompt: "ugly, blurry, bad anatomy, watermark, text", workflowPath: "", positiveNodeID: "" });
    const [models, setModels] = useState<string[]>([]);
    const [saved, setSaved] = useState(false);

    const useWorkflow = cfg.workflowPath !== "";

    const checkAndLoad = async () => {
        setConnected(null);
        try {
            const config = await GetComfyConfig();
            setCfg({ url: config.url, model: config.model, steps: config.steps, cfg: config.cfg, width: config.width, height: config.height, negativePrompt: config.negativePrompt, workflowPath: config.workflowPath ?? "", positiveNodeID: config.positiveNodeID ?? "" });
            const ok = await CheckComfyUI();
            setConnected(ok);
            if (ok) {
                const ms = await GetComfyModels();
                setModels(ms ?? []);
            }
        } catch { setConnected(false); }
    };

    useEffect(() => { checkAndLoad(); }, []);

    const handleBrowseWorkflow = async () => {
        const path = await BrowseWorkflowFile();
        if (path) setCfg(p => ({ ...p, workflowPath: path }));
    };

    const handleSave = async () => {
        await SaveComfyConfig(cfg.url, cfg.model, cfg.negativePrompt, cfg.workflowPath, cfg.positiveNodeID, cfg.steps, cfg.width, cfg.height, cfg.cfg);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    return (
        <div className="space-y-10">
            {/* Status + URL */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${connected === null ? "bg-outline/40 animate-pulse" : connected ? "bg-green-500/70" : "bg-red-400/60"}`} />
                    <span className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">
                        {connected === null ? "Checking..." : connected ? "ComfyUI Connected" : "ComfyUI Not Reachable"}
                    </span>
                </div>
                <button onClick={checkAndLoad} className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/50 hover:text-primary transition-colors">Refresh</button>
            </div>

            <div className="space-y-2">
                <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">ComfyUI URL</label>
                <input
                    value={cfg.url}
                    onChange={e => setCfg(p => ({ ...p, url: e.target.value }))}
                    className="w-full bg-surface border border-outline/40 focus:border-outline/60 text-on-surface font-serif text-sm px-4 py-2 outline-none transition-colors"
                    placeholder="http://127.0.0.1:8000"
                />
            </div>

            {/* Mode toggle */}
            <div className="space-y-4">
                <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Generation Mode</label>
                <div className="flex border border-outline/40">
                    <button
                        onClick={() => setCfg(p => ({ ...p, workflowPath: "", positiveNodeID: "" }))}
                        className={`flex-1 font-sans text-[9px] uppercase tracking-widest px-4 py-3 transition-colors ${!useWorkflow ? "bg-primary/10 text-primary border-r border-outline/40" : "text-on-surface-variant/60 hover:text-on-surface-variant border-r border-outline/40"}`}
                    >
                        Model
                    </button>
                    <button
                        onClick={() => { if (!useWorkflow) handleBrowseWorkflow(); }}
                        className={`flex-1 font-sans text-[9px] uppercase tracking-widest px-4 py-3 transition-colors ${useWorkflow ? "bg-primary/10 text-primary" : "text-on-surface-variant/60 hover:text-on-surface-variant"}`}
                    >
                        Saved Workflow
                    </button>
                </div>
            </div>

            {useWorkflow ? (
                <>
                    {/* Workflow file */}
                    <div className="space-y-2">
                        <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Workflow File (API format)</label>
                        <div className="flex gap-3">
                            <input
                                value={cfg.workflowPath}
                                readOnly
                                className="flex-1 bg-surface border border-outline/40 text-on-surface font-serif text-sm px-4 py-2 outline-none truncate"
                                placeholder="No file selected"
                            />
                            <button
                                onClick={handleBrowseWorkflow}
                                className="font-sans text-[9px] uppercase tracking-widest border border-outline/50 hover:border-primary/40 text-on-surface-variant hover:text-primary px-4 py-2 transition-colors whitespace-nowrap"
                            >
                                Browse
                            </button>
                        </div>
                        <p className="font-serif italic text-[10px] text-on-surface-variant/50">
                            Requires API format. In ComfyUI: Settings → enable "Dev Mode Options" → reload → menu shows "Save (API Format)".
                        </p>
                    </div>

                    {/* Positive node ID */}
                    <div className="space-y-2">
                        <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Positive Prompt Node ID</label>
                        <input
                            value={cfg.positiveNodeID}
                            onChange={e => setCfg(p => ({ ...p, positiveNodeID: e.target.value }))}
                            className="w-full bg-surface border border-outline/40 focus:border-outline/60 text-on-surface font-serif text-sm px-4 py-2 outline-none transition-colors"
                            placeholder="Auto-detect (first CLIPTextEncode node)"
                        />
                        <p className="font-serif italic text-[10px] text-on-surface-variant/50">
                            The node ID where the scene description will be injected. Leave blank to auto-detect.
                        </p>
                    </div>
                </>
            ) : (
                <>
                    {/* Model */}
                    <div className="space-y-2">
                        <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Checkpoint Model</label>
                        {models.length > 0 ? (
                            <select
                                value={cfg.model}
                                onChange={e => setCfg(p => ({ ...p, model: e.target.value }))}
                                className="w-full bg-surface border border-outline/40 text-on-surface font-serif text-sm px-4 py-2 outline-none appearance-none"
                            >
                                <option value="">— select a model —</option>
                                {models.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        ) : (
                            <input
                                value={cfg.model}
                                onChange={e => setCfg(p => ({ ...p, model: e.target.value }))}
                                className="w-full bg-surface border border-outline/40 focus:border-outline/60 text-on-surface font-serif text-sm px-4 py-2 outline-none transition-colors"
                                placeholder="e.g. dreamshaper_8.safetensors"
                            />
                        )}
                        <p className="font-serif italic text-[10px] text-on-surface-variant/50">
                            {connected ? "Models loaded from ComfyUI" : "Connect ComfyUI to auto-populate, or type a filename manually"}
                        </p>
                    </div>

                    {/* Steps + CFG */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Steps</label>
                                <span className="font-serif italic text-secondary">{cfg.steps}</span>
                            </div>
                            <input type="range" min={10} max={150} step={1} value={cfg.steps}
                                onChange={e => setCfg(p => ({ ...p, steps: Number(e.target.value) }))}
                                className="custom-range" />
                            <div className="flex justify-between font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/50">
                                <span>Fast</span><span>Quality</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">CFG Scale</label>
                                <span className="font-serif italic text-secondary">{cfg.cfg.toFixed(1)}</span>
                            </div>
                            <input type="range" min={1} max={20} step={0.5} value={cfg.cfg}
                                onChange={e => setCfg(p => ({ ...p, cfg: Number(e.target.value) }))}
                                className="custom-range" />
                            <div className="flex justify-between font-sans text-[9px] uppercase tracking-widest text-on-surface-variant/50">
                                <span>Creative</span><span>Strict</span>
                            </div>
                        </div>
                    </div>

                    {/* Resolution */}
                    <div className="grid grid-cols-2 gap-8">
                        {(["width", "height"] as const).map(dim => (
                            <div key={dim} className="space-y-2">
                                <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">{dim === "width" ? "Width" : "Height"}</label>
                                <select value={cfg[dim]} onChange={e => setCfg(p => ({ ...p, [dim]: Number(e.target.value) }))}
                                    className="w-full bg-surface border border-outline/40 text-on-surface font-serif text-sm px-4 py-2 outline-none appearance-none">
                                    {SIZE_PRESETS.map(s => <option key={s} value={s}>{s}px</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Negative prompt */}
                    <div className="space-y-2">
                        <label className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">Negative Prompt</label>
                        <textarea rows={2} value={cfg.negativePrompt}
                            onChange={e => setCfg(p => ({ ...p, negativePrompt: e.target.value }))}
                            className="w-full bg-surface border border-outline/40 focus:border-outline/60 text-on-surface font-serif text-sm px-4 py-3 resize-none outline-none placeholder:text-on-surface-variant/40 placeholder:italic transition-colors"
                            placeholder="What to exclude from generated images..."
                        />
                    </div>
                </>
            )}

            <button onClick={handleSave}
                className="font-sans text-[9px] uppercase tracking-widest border border-outline/50 hover:border-primary/40 text-on-surface-variant hover:text-primary px-6 py-3 transition-colors">
                {saved ? "✓ Saved" : "Save Configuration"}
            </button>
        </div>
    );
}

export default function ConfigPage() {
    const [models, setModels] = useState<main.OllamaModel[]>([]);
    const [activeModel, setActiveModelState] = useState<string>("");
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [pullInput, setPullInput] = useState("");
    const [pullStates, setPullStates] = useState<Record<string, PullState>>({});
    const [deletingModel, setDeletingModel] = useState<string | null>(null);
    const [expandedModel, setExpandedModel] = useState<string | null>(null);

    const loadModels = async () => {
        try {
            const [ms, active] = await Promise.all([GetOllamaModels(), GetActiveModel()]);
            setModels(ms ?? []);
            setActiveModelState(active);
            setModelsError(null);
        } catch {
            setModelsError("Ollama not reachable. Is it running?");
        }
    };

    useEffect(() => {
        loadModels();
        const offProgress = EventsOn("model:pull:progress", (data: { name: string; progress: PullProgress }) => {
            setPullStates(prev => ({ ...prev, [data.name]: { active: true, progress: data.progress, error: null } }));
        });
        const offDone = EventsOn("model:pull:done", (data: { name: string }) => {
            setPullStates(prev => ({ ...prev, [data.name]: { active: false, progress: null, error: null } }));
            loadModels();
        });
        const offError = EventsOn("model:pull:error", (data: { name: string; error: string }) => {
            setPullStates(prev => ({ ...prev, [data.name]: { active: false, progress: null, error: data.error } }));
        });
        return () => { offProgress(); offDone(); offError(); };
    }, []);

    const handleSetActive = async (name: string) => {
        await SetActiveModel(name);
        setActiveModelState(name);
    };

    const handlePull = () => {
        const name = pullInput.trim();
        if (!name) return;
        setPullStates(prev => ({ ...prev, [name]: { active: true, progress: null, error: null } }));
        PullModel(name);
        setPullInput("");
    };

    const handleDelete = async (name: string) => {
        setDeletingModel(name);
        try { await DeleteModel(name); await loadModels(); }
        catch (e: any) { alert("Failed to delete: " + e); }
        finally { setDeletingModel(null); }
    };

    return (
        <div className="h-screen">
            <main className="sidebar-main overflow-y-auto bg-background px-16 py-16 pb-20">
                <header className="mb-20 max-w-4xl border-b border-outline/40 pb-12">
                    <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary font-bold mb-6">
                        {modelsError
                            ? "Status: Ollama Unreachable"
                            : `Status: Ollama Connected · ${models.length} model${models.length !== 1 ? "s" : ""} installed`}
                    </div>
                    <h1 className="text-7xl font-serif font-light tracking-tight text-on-surface mb-8">
                        Neural <span className="italic">Configuration</span>
                    </h1>
                    <p className="font-serif text-xl text-on-surface/70 max-w-2xl leading-relaxed italic">
                        Configure the local Ollama model powering Plotter. Install, remove, or activate
                        models and shape how the narrator thinks.
                    </p>
                </header>

                <div className="max-w-4xl space-y-24">

                    {/* Installed Models */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-end border-b border-outline/50 pb-4">
                            <h3 className="text-xl font-serif text-on-surface uppercase tracking-widest">Installed Models</h3>
                            <span className="font-serif italic text-sm text-on-surface-variant">via Ollama (local)</span>
                        </div>

                        {modelsError ? (
                            <p className="font-serif italic text-sm text-on-surface-variant opacity-60">{modelsError}</p>
                        ) : models.length === 0 ? (
                            <p className="font-serif italic text-sm text-on-surface-variant opacity-60">No models installed. Pull one below.</p>
                        ) : (
                            <div className="space-y-0">
                                {models.map((m) => {
                                    const isActive = m.name === activeModel;
                                    const isExpanded = expandedModel === m.name;
                                    return (
                                        <div key={m.name} className="border-b border-outline/25">
                                            {/* Model row */}
                                            <div className="flex items-center justify-between py-6">
                                                <div className="flex items-center space-x-6">
                                                    <div className={`w-10 h-10 border flex items-center justify-center ${isActive ? "border-primary/40" : "border-outline/50 grayscale"}`}>
                                                        <span className={`material-symbols-outlined ${isActive ? "text-primary" : "text-on-surface-variant"}`}>psychology</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-serif text-lg text-on-surface">
                                                            {m.name.includes(":") ? (
                                                                <>{m.name.split(":")[0]} <span className="italic text-on-surface-variant text-base">{m.name.split(":")[1]}</span></>
                                                            ) : m.name}
                                                        </div>
                                                        <div className="font-serif italic text-xs text-on-surface-variant space-x-3">
                                                            {m.parameterSize && <span>{m.parameterSize}</span>}
                                                            {m.quantizationLevel && <span>{m.quantizationLevel}</span>}
                                                            {m.size > 0 && <span>{formatBytes(m.size)}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    {isActive ? (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-4 h-4 border border-primary flex items-center justify-center">
                                                                <div className="w-2 h-2 bg-primary" />
                                                            </div>
                                                            <span className="font-sans text-[9px] uppercase tracking-widest text-primary">Active</span>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSetActive(m.name)}
                                                            className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors border border-outline/50 hover:border-primary/40 px-4 py-2"
                                                        >
                                                            Set Active
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setExpandedModel(isExpanded ? null : m.name)}
                                                        className="text-on-surface-variant/50 hover:text-on-surface transition-colors px-1"
                                                        title="Configure"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {isExpanded ? "expand_less" : "tune"}
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(m.name)}
                                                        disabled={deletingModel === m.name}
                                                        className="text-on-surface-variant/40 hover:text-red-400 transition-colors disabled:opacity-30"
                                                        title="Delete model"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable config fields */}
                                            {isExpanded && (
                                                <div className="pb-8 px-2">
                                                    <ModelConfigFields model={m.name} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* In-progress pulls */}
                        {Object.entries(pullStates)
                            .filter(([name, s]) => s.active && !models.find(m => m.name === name))
                            .map(([name, s]) => (
                                <div key={name} className="py-6 border-b border-outline/25 space-y-3">
                                    <div className="flex items-center space-x-4">
                                        <span className="material-symbols-outlined text-primary/60 animate-pulse text-xl">downloading</span>
                                        <span className="font-serif text-on-surface">{name}</span>
                                        <span className="font-serif italic text-xs text-on-surface-variant">{s.progress?.status ?? "Initialising..."}</span>
                                    </div>
                                    {s.progress && s.progress.total > 0 && (
                                        <div className="space-y-1">
                                            <div className="h-[2px] bg-outline/20 w-full">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${s.progress.percent}%` }} />
                                            </div>
                                            <div className="flex justify-between font-sans text-[9px] uppercase tracking-widest text-on-surface-variant">
                                                <span>{s.progress.status}</span>
                                                <span>{s.progress.percent.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </section>

                    {/* Install Model */}
                    <section className="space-y-8">
                        <h3 className="text-xl font-serif text-on-surface uppercase tracking-widest border-b border-outline/50 pb-4">Install Model</h3>
                        <div className="space-y-6">
                            <p className="font-serif italic text-sm text-on-surface/60">
                                Enter any model name from the Ollama library —{" "}
                                <span className="not-italic font-sans text-xs text-secondary">mistral:7b</span>,{" "}
                                <span className="not-italic font-sans text-xs text-secondary">llama3:8b</span>,{" "}
                                <span className="not-italic font-sans text-xs text-secondary">phi3:mini</span>.
                            </p>
                            <div className="flex items-center border-b border-on-surface/20 py-2 space-x-4">
                                <input
                                    type="text"
                                    value={pullInput}
                                    onChange={e => setPullInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") handlePull(); }}
                                    placeholder="model:tag"
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-on-surface/30 px-0 font-serif italic text-lg outline-none"
                                />
                                <button
                                    onClick={handlePull}
                                    disabled={!pullInput.trim()}
                                    className="font-sans text-[9px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors border border-outline/50 hover:border-primary/40 px-6 py-3 disabled:opacity-30"
                                >
                                    Pull
                                </button>
                            </div>
                            {Object.entries(pullStates).filter(([, s]) => s.error).map(([name, s]) => (
                                <p key={name} className="font-serif italic text-xs text-red-400/80">
                                    Failed to pull <span className="not-italic font-sans">{name}</span>: {s.error}
                                </p>
                            ))}
                        </div>
                    </section>

                    {/* Image Generation */}
                    <section className="space-y-8">
                        <div className="flex justify-between items-end border-b border-outline/50 pb-4">
                            <h3 className="text-xl font-serif text-on-surface uppercase tracking-widest">Image Generation</h3>
                            <span className="font-serif italic text-sm text-on-surface-variant">via ComfyUI (local)</span>
                        </div>
                        <p className="font-serif italic text-sm text-on-surface/60 max-w-2xl">
                            Connect a local <span className="not-italic font-sans text-xs text-secondary">ComfyUI</span> instance to generate scene illustrations inline. Load any checkpoint — including uncensored models from CivitAI.
                        </p>
                        <ComfySection />
                    </section>

                    {/* Generation Parameters */}
                    <section className="space-y-12">
                        <h3 className="text-xl font-serif text-on-surface uppercase tracking-widest border-b border-outline/50 pb-4">Generation Parameters</h3>
                        <div className="max-w-lg space-y-12">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <label className="font-serif text-sm uppercase tracking-wider text-on-surface/80">Temperature</label>
                                    <span className="font-serif italic text-secondary text-lg">0.85</span>
                                </div>
                                <input className="custom-range" type="range" min="0" max="2" step="0.01" defaultValue="0.85" />
                                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-sans">
                                    <span>Deterministic</span><span>Creative</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <label className="font-serif text-sm uppercase tracking-wider text-on-surface/80">Top-P Sampling</label>
                                    <span className="font-serif italic text-primary text-lg">0.92</span>
                                </div>
                                <input className="custom-range" type="range" min="0" max="1" step="0.01" defaultValue="0.92" />
                                <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60 font-sans">
                                    <span>Focused</span><span>Diverse</span>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
                <div className="h-24" />
            </main>
        </div>
    );
}
