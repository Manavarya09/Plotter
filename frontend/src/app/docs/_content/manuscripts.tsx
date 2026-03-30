import { Tip } from "../_components/Callouts";
import { InlineKey } from "../_components/Callouts";
import type { SectionDef } from "./types";

export const manuscripts: SectionDef = {
    id: "manuscripts",
    label: "Manuscripts",
    icon: "auto_stories",
    subtitle: "Organise and manage your collection of stories.",
    items: [
        {
            title: "Story statuses",
            body: (
                <div className="space-y-3">
                    <p>
                        Every manuscript has one of three statuses. Use the filter tabs at the top of the
                        Manuscripts page to switch views:
                    </p>
                    <div className="border border-outline/30 divide-y divide-outline/20">
                        <div className="flex items-start space-x-4 px-5 py-4">
                            <InlineKey>Active</InlineKey>
                            <p className="text-sm">
                                Stories you're currently writing. The default view — everything in progress
                                lives here.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4 px-5 py-4">
                            <InlineKey>Complete</InlineKey>
                            <p className="text-sm">
                                Finished stories. Still readable and playable, but separated from your
                                active work.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4 px-5 py-4">
                            <InlineKey>Archived</InlineKey>
                            <p className="text-sm">
                                Stories you've set aside. They don't appear in your main view but are never
                                deleted.
                            </p>
                        </div>
                    </div>
                    <Tip>
                        Right-click any manuscript card to change its status, or delete it permanently.
                        Deleted stories cannot be recovered.
                    </Tip>
                </div>
            ),
        },
        {
            title: "Reordering manuscripts",
            body: (
                <div className="space-y-3">
                    <p>
                        Drag any manuscript card and drop it onto another to reorder your collection. The
                        story you open most recently automatically rises to the top.
                    </p>
                    <p>
                        The first card in the grid is your{" "}
                        <strong className="text-on-surface">featured manuscript</strong> — it spans two
                        columns with a larger preview, cover image, and synopsis.
                    </p>
                </div>
            ),
        },
        {
            title: "Cover images",
            body: (
                <div className="space-y-3">
                    <p>
                        Cover images are set from inside the Chronicle. Open the{" "}
                        <strong className="text-on-surface">Story Settings panel</strong> on the right side
                        of the chat and look for the cover image field at the top.
                    </p>
                    <p>
                        If no cover is set, the card shows a placeholder book icon. Covers are stored
                        locally and never uploaded anywhere.
                    </p>
                </div>
            ),
        },
    ],
};
