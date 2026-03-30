import * as App from "../../wailsjs/go/main/App";
import { EventsOn as RuntimeEventsOn } from "../../wailsjs/runtime/runtime";
import type { main, store } from "../../wailsjs/go/models";

function hasAppMethod(method: string): boolean {
    if (typeof window === "undefined") return false;
    return typeof (window as any)?.go?.main?.App?.[method] === "function";
}

function hasRuntimeEvents(): boolean {
    if (typeof window === "undefined") return false;
    return typeof (window as any)?.runtime?.EventsOnMultiple === "function";
}

function callApp<T>(method: string, exec: () => Promise<T>, fallback: T): Promise<T> {
    if (!hasAppMethod(method)) return Promise.resolve(fallback);
    return exec();
}

export function BrowseWorkflowFile(): Promise<string> {
    return callApp("BrowseWorkflowFile", () => App.BrowseWorkflowFile(), "");
}

export function CheckComfyUI(): Promise<boolean> {
    return callApp("CheckComfyUI", () => App.CheckComfyUI(), false);
}

export function ClearBackground(): Promise<void> {
    return callApp("ClearBackground", () => App.ClearBackground(), undefined);
}

export function ClearStoryCoverImage(arg1: string): Promise<store.Story> {
    return callApp("ClearStoryCoverImage", () => App.ClearStoryCoverImage(arg1), null as unknown as store.Story);
}

export function CreateStory(arg1: string, arg2: string, arg3: string): Promise<store.Story> {
    return callApp("CreateStory", () => App.CreateStory(arg1, arg2, arg3), null as unknown as store.Story);
}

export function CreateUserTemplate(arg1: string, arg2: string, arg3: string, arg4: string, arg5: string, arg6: string, arg7: boolean, arg8: string, arg9: string, arg10: string, arg11: string, arg12: string): Promise<store.UserTemplate> {
    return callApp("CreateUserTemplate", () => App.CreateUserTemplate(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12), null as unknown as store.UserTemplate);
}

export function DeleteModel(arg1: string): Promise<void> {
    return callApp("DeleteModel", () => App.DeleteModel(arg1), undefined);
}

export function DeleteSession(arg1: string, arg2: string): Promise<void> {
    return callApp("DeleteSession", () => App.DeleteSession(arg1, arg2), undefined);
}

export function DeleteStory(arg1: string): Promise<void> {
    return callApp("DeleteStory", () => App.DeleteStory(arg1), undefined);
}

export function DeleteUserTemplate(arg1: string): Promise<void> {
    return callApp("DeleteUserTemplate", () => App.DeleteUserTemplate(arg1), undefined);
}

export function GenerateImage(arg1: string, arg2: string): Promise<string> {
    return callApp("GenerateImage", () => App.GenerateImage(arg1, arg2), "");
}

export function GenerateStoryIdea(arg1: string): Promise<string> {
    return callApp("GenerateStoryIdea", () => App.GenerateStoryIdea(arg1), "");
}

export function GetActiveModel(): Promise<string> {
    return callApp("GetActiveModel", () => App.GetActiveModel(), "");
}

export function GetBackground(): Promise<string> {
    return callApp("GetBackground", () => App.GetBackground(), "");
}

export function GetComfyConfig(): Promise<main.ComfyConfig> {
    const fallback: main.ComfyConfig = {
        url: "http://127.0.0.1:8000",
        model: "",
        negativePrompt: "",
        workflowPath: "",
        positiveNodeID: "",
        steps: 20,
        width: 512,
        height: 768,
        cfg: 7,
    };
    return callApp("GetComfyConfig", () => App.GetComfyConfig(), fallback);
}

export function GetComfyModels(): Promise<Array<string>> {
    return callApp("GetComfyModels", () => App.GetComfyModels(), []);
}

export function GetModelConfig(arg1: string): Promise<main.ModelConfig> {
    const fallback: main.ModelConfig = {
        aiInstructions: "",
        storyInstructions: "",
        authorNotes: "",
    };
    return callApp("GetModelConfig", () => App.GetModelConfig(arg1), fallback);
}

export function GetOllamaModels(): Promise<Array<main.OllamaModel>> {
    return callApp("GetOllamaModels", () => App.GetOllamaModels(), []);
}

export function GetSessions(arg1: string): Promise<Array<store.Session>> {
    return callApp("GetSessions", () => App.GetSessions(arg1), []);
}

export function GetStories(): Promise<Array<store.Story>> {
    return callApp("GetStories", () => App.GetStories(), []);
}

export function GetStory(arg1: string): Promise<store.Story> {
    return callApp("GetStory", () => App.GetStory(arg1), null as unknown as store.Story);
}

export function GetUserTemplates(): Promise<Array<store.UserTemplate>> {
    return callApp("GetUserTemplates", () => App.GetUserTemplates(), []);
}

export function PickBackgroundImage(): Promise<string> {
    return callApp("PickBackgroundImage", () => App.PickBackgroundImage(), "");
}

export function PickStoryCoverImage(arg1: string): Promise<store.Story> {
    return callApp("PickStoryCoverImage", () => App.PickStoryCoverImage(arg1), null as unknown as store.Story);
}

export function PullModel(arg1: string): Promise<void> {
    return callApp("PullModel", () => App.PullModel(arg1), undefined);
}

export function SaveComfyConfig(arg1: string, arg2: string, arg3: string, arg4: string, arg5: string, arg6: number, arg7: number, arg8: number, arg9: number): Promise<void> {
    return callApp("SaveComfyConfig", () => App.SaveComfyConfig(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9), undefined);
}

export function SaveModelConfig(arg1: string, arg2: string, arg3: string, arg4: string): Promise<void> {
    return callApp("SaveModelConfig", () => App.SaveModelConfig(arg1, arg2, arg3, arg4), undefined);
}

export function SaveSession(arg1: string, arg2: string, arg3: string): Promise<store.Session> {
    return callApp("SaveSession", () => App.SaveSession(arg1, arg2, arg3), null as unknown as store.Session);
}

export function SetActiveModel(arg1: string): Promise<void> {
    return callApp("SetActiveModel", () => App.SetActiveModel(arg1), undefined);
}

export function StreamMessage(arg1: string, arg2: Array<main.ChatMessage>, arg3: string, arg4: string): Promise<void> {
    return callApp("StreamMessage", () => App.StreamMessage(arg1, arg2, arg3, arg4), undefined);
}

export function UpdateStory(arg1: string, arg2: string, arg3: string, arg4: string): Promise<store.Story> {
    return callApp("UpdateStory", () => App.UpdateStory(arg1, arg2, arg3, arg4), null as unknown as store.Story);
}

export function UpdateStorySettings(arg1: string, arg2: string, arg3: boolean, arg4: string, arg5: string, arg6: string, arg7: string): Promise<store.Story> {
    return callApp("UpdateStorySettings", () => App.UpdateStorySettings(arg1, arg2, arg3, arg4, arg5, arg6, arg7), null as unknown as store.Story);
}

export function UpdateStoryStatus(arg1: string, arg2: string): Promise<store.Story> {
    return callApp("UpdateStoryStatus", () => App.UpdateStoryStatus(arg1, arg2), null as unknown as store.Story);
}

export function EventsOn(eventName: string, callback: (...data: any[]) => void): () => void {
    if (!hasRuntimeEvents()) return () => {};
    return RuntimeEventsOn(eventName, callback);
}
