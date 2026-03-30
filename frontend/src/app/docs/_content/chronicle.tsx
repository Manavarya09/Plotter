import { Tip, Note, InlineKey } from "../_components/Callouts";
import type { SectionDef } from "./types";

export const chronicle: SectionDef = {
    id: "chronicle",
    label: "The Chronicle",
    icon: "forum",
    subtitle: "The interactive fiction stage — where every story is told.",
    items: [
        {
            title: "How the Chronicle works",
            body: (
                <div className="space-y-3">
                    <p>
                        The Chronicle is the main storytelling interface. You and the AI Narrator take
                        turns: you submit an action, dialogue, or scene request — the narrator responds
                        with the world's reaction.
                    </p>
                    <p>
                        Your messages appear on the right side of the screen (as the Traveller). The
                        narrator's responses appear on the left. The story accumulates as a continuous
                        scroll.
                    </p>
                    <Note>
                        The AI responds based on the full conversation history, your story settings, and
                        the model configuration. Longer sessions give it more context to work with.
                    </Note>
                </div>
            ),
        },
        {
            title: "The three input modes",
            body: (
                <div className="space-y-4">
                    <p>
                        At the bottom of the Chronicle you'll find three mode buttons. Each changes how
                        your input is interpreted by the narrator:
                    </p>
                    <div className="border border-outline/30 divide-y divide-outline/20 bg-surface">
                        <div className="flex items-start space-x-4 px-5 py-5">
                            <div className="shrink-0 pt-0.5">
                                <InlineKey>Act</InlineKey>
                            </div>
                            <div className="space-y-1">
                                <p>
                                    Describe what your character <em>does</em>. Physical actions, movements,
                                    decisions, interactions with the environment.
                                </p>
                                <p className="italic text-on-surface-variant/50">
                                    "I push open the heavy iron door and step into the dark corridor."
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4 px-5 py-5">
                            <div className="shrink-0 pt-0.5">
                                <InlineKey>Speak</InlineKey>
                            </div>
                            <div className="space-y-1">
                                <p>
                                    Write dialogue — what your character <em>says</em> aloud to another
                                    character or to the room.
                                </p>
                                <p className="italic text-on-surface-variant/50">
                                    "Tell me where the passage beneath the chapel leads."
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4 px-5 py-5">
                            <div className="shrink-0 pt-0.5">
                                <InlineKey>See</InlineKey>
                            </div>
                            <div className="space-y-1">
                                <p>
                                    Request a scene description without taking any action. Useful for
                                    grounding yourself in the environment.
                                </p>
                                <p className="italic text-on-surface-variant/50">
                                    "Describe the room I've just entered in detail."
                                </p>
                            </div>
                        </div>
                    </div>
                    <Tip>
                        Switch modes freely at any point — there's no restriction on order or frequency.
                        Mixing all three tends to produce the most immersive sessions.
                    </Tip>
                </div>
            ),
        },
        {
            title: "Saving your session",
            body: (
                <div className="space-y-3">
                    <p>
                        Your chat history is saved automatically in local storage as you play. To create a
                        permanent record, use the save button in the Chronicle toolbar — this exports your
                        session as a <strong className="text-on-surface">Markdown file</strong> stored
                        locally in your Plotter data directory.
                    </p>
                    <p>
                        Saved sessions can be opened in any text editor and read as a formatted story.
                    </p>
                    <Note>
                        Clearing your browser's local storage will erase your in-progress session history.
                        Save to file regularly if you're running a long playthrough.
                    </Note>
                </div>
            ),
        },
        {
            title: "Editing messages",
            body: (
                <div className="space-y-3">
                    <p>
                        Hover over any of your own messages to reveal an edit button. You can revise what
                        you wrote — the narrator's existing response won't change automatically, but you
                        can continue the story forward from the revised point.
                    </p>
                    <Tip>
                        Editing earlier messages is a good way to steer a story that went in the wrong
                        direction without restarting from scratch.
                    </Tip>
                </div>
            ),
        },
    ],
};
