export type Character = {
    id: string;
    name: string;
    description: string;
};

export type Template = {
    id: string;
    name: string;
    genre: string;
    tagline: string;
    description: string;
    moods: string[];
    icon: string;
    nsfw: boolean;
    // pre-filled story settings
    synopsis: string;
    storyInstructions: string;
    authorNotes: string;
    storyOutline: string;
    aiInstructions: string;
    characters: Character[];
};

const id = () => Math.random().toString(36).slice(2);

export const TEMPLATES: Template[] = [
    {
        id: "sci-fi",
        name: "The Void Between Stars",
        genre: "Science Fiction",
        tagline: "You are the only one left awake.",
        description:
            "A lone crew member on a research vessel drifting off-course. The crew is missing. The ship's AI is behaving strangely. The answers are out there — somewhere.",
        moods: ["isolation", "dread", "discovery"],
        icon: "rocket",
        nsfw: false,
        synopsis:
            "You wake in the medbay of the IRCS Meridian, three days behind schedule and completely alone. The crew manifest shows twelve names. Every bunk is empty.",
        storyInstructions:
            "Hard sci-fi tone — technology should feel grounded in near-future plausibility. Focus on isolation and the tension between logic and fear. Reveal information in fragments: log entries, system readouts, environmental details. Never give the player easy answers.",
        authorNotes:
            "The crew didn't disappear — they chose to leave, drawn toward a signal the ship picked up six days ago. ARIA (the ship AI) knows this but is bound by a protocol she cannot explain. The signal is still transmitting.",
        storyOutline:
            "Act 1: Disorientation — piece together what happened through logs and the ship's state.\nAct 2: The Signal — ARIA begins dropping hints; the source becomes a destination.\nAct 3: The Choice — reach the origin and decide whether to follow the crew or turn back.",
        aiInstructions:
            "Write in a precise, almost clinical tone that occasionally cracks under the weight of the situation. ARIA speaks in short, careful sentences and avoids direct answers. The ship itself should feel alive — sounds, flickers, shifts in gravity.",
        characters: [
            {
                id: id(),
                name: "ARIA",
                description:
                    "The ship's integrated AI. Calm, methodical, and increasingly evasive. She answers every question technically truthfully but volunteers nothing. She seems almost apologetic.",
            },
            {
                id: id(),
                name: "Dr. Yuen (voice logs only)",
                description:
                    "The mission's chief scientist. Left behind a series of increasingly fragmented audio logs. Her tone shifts from excited to frightened to something that sounds almost like peace.",
            },
        ],
    },
    {
        id: "rom-com",
        name: "The Wrong Floor",
        genre: "Romantic Comedy",
        tagline: "You pressed 4. You live on 5. Now everything is complicated.",
        description:
            "You move into a new apartment and immediately, catastrophically, offend your downstairs neighbour. You will see them in the lift every single morning.",
        moods: ["warm", "witty", "chaotic"],
        icon: "apartment",
        nsfw: false,
        synopsis:
            "Your first night in the new flat, you drop something heavy at 11pm. The person below you knocks. The conversation does not go well. You will be seeing a lot of each other.",
        storyInstructions:
            "Keep the tone light, warm, and fast. Misunderstandings should compound rather than resolve. Secondary characters are loveable disasters who make everything worse while trying to help. Avoid melodrama — when things get serious, cut away with a joke. The romance should develop through accumulated small moments, not declarations.",
        authorNotes:
            "The neighbour (Jamie) has been burned before and built walls around it. They are not cold — they are careful. The player's casual confidence is both aggravating and, quietly, compelling to them.",
        storyOutline:
            "Phase 1: Hostile coexistence — separate lives with unfortunate overlap.\nPhase 2: Reluctant allies — a shared problem forces cooperation.\nPhase 3: The complication — feelings arrive at the worst possible moment.",
        aiInstructions:
            "Write with wit and pace. Dialogue should snap. Physical comedy is welcome. The world around the player should be slightly heightened — neighbours who are too nosy, lifts that break at key moments, coffee shops with no table space. Jamie's dry humour should emerge slowly.",
        characters: [
            {
                id: id(),
                name: "Jamie",
                description:
                    "Lives directly below. Works in architecture. Dry, precise, not unfriendly — but has a very clear idea of how their life is supposed to go, and you are not in the blueprint.",
            },
            {
                id: id(),
                name: "Rosa",
                description:
                    "Your best friend. Aggressively supportive, chronically unhelpful, and absolutely certain she knows what you should do next. She is wrong but enthusiastic.",
            },
            {
                id: id(),
                name: "Mr. Osei",
                description:
                    "The building's unofficial superintendent. Knows everything that happens on every floor. Dispenses advice no one asked for and is correct about 60% of the time.",
            },
        ],
    },
    {
        id: "isekai",
        name: "The Summoned",
        genre: "Isekai Fantasy",
        tagline: "A circle of robes. A world that shouldn't exist. Your name, spoken like a prayer.",
        description:
            "Pulled from your world without warning into a realm of old magic and older politics. The people who summoned you are afraid of what they've done. They should be.",
        moods: ["wonder", "adventure", "power"],
        icon: "auto_awesome",
        nsfw: false,
        synopsis:
            "A flash of white. Stone floor. The smell of candle smoke and something older. A circle of robed figures staring at you with an expression halfway between reverence and terror. One of them says: 'It worked.'",
        storyInstructions:
            "Classic isekai energy — new world, strange rules, a protagonist with potential they don't fully understand yet. Prioritise the wonder of discovery. Introduce the magic system, world politics, and factions gradually through experience rather than exposition dumps. The player should feel powerful but not invulnerable — there are things here that don't care about chosen ones.",
        authorNotes:
            "The summoning wasn't supposed to call a person. It was supposed to call a concept — a weapon, an idea. The player is the closest thing the ritual could find. Elara knows this and is hiding it. The Elder knows this and considers it an acceptable sacrifice.",
        storyOutline:
            "Arc 1: Arrival — understand where you are and why you were summoned.\nArc 2: The Factions — three powers each want to use you for different ends.\nArc 3: The Truth — discover what the ritual actually summoned and what it means for this world.",
        aiInstructions:
            "Write with scale and colour. This world has history in every stone. NPCs speak formally but with distinct personalities underneath the decorum. Magic should feel genuinely alien — not fireball-and-shields, but something older and stranger. The player's modern sensibility should occasionally clash with the world in ways that are both funny and illuminating.",
        characters: [
            {
                id: id(),
                name: "Elara",
                description:
                    "The youngest summoner, 24, who actually performed the ritual. Nervous, brilliant, and carrying a secret she is not ready to share. Genuinely wants to help the player — or at least, that is what she tells herself.",
            },
            {
                id: id(),
                name: "The Elder",
                description:
                    "Ancient. Speaks rarely. When he does, everyone else in the room stops breathing. He sees the player as a resource, not a person, but he is not cruel — just pragmatic in ways that are hard to forgive.",
            },
            {
                id: id(),
                name: "Kael",
                description:
                    "A soldier assigned as the player's escort. Deeply sceptical, professionally courteous, privately curious. Will become loyal if the player earns it, and that loyalty will mean something.",
            },
        ],
    },
    {
        id: "erotic",
        name: "The Letter",
        genre: "Erotic Fiction",
        tagline: "No return address. One line. A time and a place.",
        description:
            "A letter arrives with no explanation. Inside is a single line of prose and a location. You go. You aren't sure why.",
        moods: ["tension", "sensual", "intimate"],
        icon: "mail",
        nsfw: true,
        synopsis:
            "The envelope has no stamp. It was slipped under your door overnight. Inside: a handwritten line — 'I have been thinking about you for longer than you know.' Below that, an address and a time. Tonight.",
        storyInstructions:
            "Slow burn. Build tension through atmosphere, restraint, and suggestion before anything becomes explicit. Every detail — a glance, a pause in conversation, the way someone holds a glass — should carry weight. The world should feel slightly heightened and charged. Consent and desire are both active, present forces.",
        authorNotes:
            "The sender has been watching the player for months from a distance, working up the courage. The meeting tonight was not impulsive — it was planned meticulously. They are nervous underneath the composure they're presenting. They did not expect the player to actually come.",
        storyOutline:
            "The letter → the location → the meeting → what follows. Pacing is everything. The narrator controls the tempo — let the player set the direction.",
        aiInstructions:
            "Write with restraint that slowly, deliberately dissolves. Sensory detail is paramount — scent, texture, the quality of light, the sound of breathing. Explicit content should feel earned rather than rushed. Characters should remain psychologically coherent throughout — desire doesn't erase personality.",
        characters: [
            {
                id: id(),
                name: "The Sender",
                description:
                    "Their identity is a mystery at first. When revealed: composed on the surface, quietly undone underneath. Has thought about this moment in detail. Adapt their specific details to whatever the player establishes.",
            },
        ],
    },
    {
        id: "comedy",
        name: "The Interview",
        genre: "Comedy",
        tagline: "You need this job. This company does not make sense.",
        description:
            "You're interviewing for a position you desperately need at a company that is increasingly, obviously, not what it claims to be. The red flags are everywhere. You need the money.",
        moods: ["absurd", "chaotic", "escalating"],
        icon: "work",
        nsfw: false,
        synopsis:
            "The office is normal. The receptionist is normal. The first question in your interview is: 'If you were a geological formation, which one and why.' You need this job.",
        storyInstructions:
            "Escalating absurdity — each scene should be more ridiculous than the last, but the internal logic must hold. The player is the straight man. Everyone else is committed to the bit. Never wink at the camera — play everything completely straight. The company's secret should be genuinely absurd but have its own internal consistency.",
        authorNotes:
            "The company is real but its purpose is something no sane person would put in a job listing. The employees are all true believers. The interviewer genuinely thinks this is a normal company doing normal things. The player will be the only person who thinks any of this is strange.",
        storyOutline:
            "Round 1: The interview — increasingly surreal questions.\nRound 2: The office tour — glimpses of what actually goes on here.\nRound 3: The offer — and the decision of whether to take it.",
        aiInstructions:
            "Deadpan is everything. The narrator treats absurd events with complete normalcy. Secondary characters are enthusiastic about things that should not exist. Dialogue should be fast and punchy. Build to moments of genuine comedic chaos, then let them breathe before the next escalation.",
        characters: [
            {
                id: id(),
                name: "Delphine",
                description:
                    "Your interviewer. HR manager. Utterly professional, completely sincere, and currently asking you to rank yourself on a scale of 'cloud' to 'very much cloud'. Does not understand why you look confused.",
            },
            {
                id: id(),
                name: "Marcus",
                description:
                    "Another candidate waiting in reception. Has been here for three hours. Is starting to accept things. Will tell you things if you ask the right way.",
            },
        ],
    },
    {
        id: "horror",
        name: "The Inheritance",
        genre: "Horror",
        tagline: "They left everything behind. They left in a hurry.",
        description:
            "You've inherited a house from a relative you never knew existed. The previous owners didn't take their things when they left. You find out why slowly.",
        moods: ["dread", "atmospheric", "slow-burn"],
        icon: "night_shelter",
        nsfw: false,
        synopsis:
            "A solicitor's letter. A house on the edge of a town you've never heard of. A key that doesn't look like it belongs to anything modern. When you arrive, the table is still set for dinner.",
        storyInstructions:
            "No jump scares — only creeping dread. The horror should reveal itself in wrong details: a proportion slightly off, a sound that stops just before you can identify it, a window that looks out on a view that doesn't match the house's position. The house itself is the primary antagonist. Let it breathe.",
        authorNotes:
            "The house is not haunted — it is alive, and it has been waiting for someone to come back. It does not want to harm the player. It wants to keep them. The previous owners weren't victims — they were guests who stayed too long and stopped being able to leave. The house believed they chose to stay.",
        storyOutline:
            "Week 1: Strangeness — details that don't add up, comfort that feels engineered.\nWeek 2: Understanding — what the house is, what happened to the others.\nWeek 3: The offer and the choice — stay, or try to leave.",
        aiInstructions:
            "Atmosphere over action. Every room should feel inhabited by something patient. Use silence and restraint — what is NOT described is often scarier than what is. The house's hospitality should feel genuine and therefore more disturbing. Write the horror in the gaps.",
        characters: [
            {
                id: id(),
                name: "The House",
                description:
                    "Not a character in the traditional sense — more a presence. It adjusts temperatures, changes small details, ensures the player is comfortable. It is not malevolent. It is lonely, and it has been alone for a long time.",
            },
            {
                id: id(),
                name: "Mrs. Calloway",
                description:
                    "A neighbour who visits on the second day with a pie. Warm, friendly, and carefully doesn't answer certain questions. She knows what the house is. She considers it none of her business.",
            },
        ],
    },
    {
        id: "dark",
        name: "Ashes",
        genre: "Dark Fiction",
        tagline: "The city was divided six years ago. You work for the people who drew the lines.",
        description:
            "A city fractured by a wall and the bureaucracy that maintains it. You are part of that bureaucracy. You are starting to understand what that means.",
        moods: ["gritty", "moral weight", "consequence"],
        icon: "location_city",
        nsfw: false,
        synopsis:
            "You process transit permits for Sector 4. You have done this for three years. Today someone submits an application with a name on it you recognise — someone who should not be alive.",
        storyInstructions:
            "Moral ambiguity throughout — no clear heroes, no clean choices. Consequences are permanent and compound. Violence exists but is never gratuitous; it always costs something. The system the player works within is not cartoonishly evil — it has its own logic, its own believers, its own internal justifications. That is what makes it frightening.",
        authorNotes:
            "The player is complicit. Not uniquely so — the whole city is — but specifically, directly complicit in something that happened in the first month after the wall went up. They may not remember clearly. The permit application is from someone who was on the wrong side of that decision.",
        storyOutline:
            "The application → investigation → confrontation with the past → a choice that cannot be undone.",
        aiInstructions:
            "Write in a measured, slightly exhausted tone — the voice of someone who has made peace with things they shouldn't have. The world should feel real and heavy. Secondary characters are not villains; they are people who made the same accommodations the player did. Dialogue should be careful, layered.",
        characters: [
            {
                id: id(),
                name: "Hara",
                description:
                    "Your supervisor. Ten years in the department. Genuinely believes the division was necessary. Is kind to the people she works with. Does not examine certain things too closely.",
            },
            {
                id: id(),
                name: "The Applicant",
                description:
                    "Name redacted until the player finds them. Someone from before the wall. Their presence is impossible and their purpose is unclear. They do not seem angry — which is worse.",
            },
        ],
    },
    {
        id: "supernatural",
        name: "The Hollow",
        genre: "Supernatural Thriller",
        tagline: "Three people went missing in the same valley. You are the fourth to go looking.",
        description:
            "A valley where the signal dies and the locals stop making eye contact. People have gone missing here. The official explanations don't hold together.",
        moods: ["eerie", "investigative", "mythology"],
        icon: "forest",
        nsfw: false,
        synopsis:
            "The last disappearance was fourteen months ago. The file was closed. You are here because someone — a family member, a friend, a professional obligation — makes closing it impossible.",
        storyInstructions:
            "Blend grounded investigation with slowly emerging supernatural elements. The answers should feel earned, not arbitrary. Build mythology carefully — what the locals know (but won't say) versus what they believe versus what is actually true are three different things. The valley itself has rules. Learn them before breaking them.",
        authorNotes:
            "The Hollow is a place where the boundary between the living and something older is very thin. The missing people are not dead — they crossed through. Whether they can come back is the central question. Wren knows this. She has been trying to find the crossing point again for two years.",
        storyOutline:
            "Investigation phase → first contact with the supernatural → understanding the rules → the crossing point → the choice.",
        aiInstructions:
            "Ground everything in sensory reality — the cold, the specific quality of the silence, the way animals behave. Let the supernatural emerge through wrongness rather than spectacle. Locals should feel like real people with their own lives, not exposition dispensers. Wren's knowledge should emerge through action and observation, not monologue.",
        characters: [
            {
                id: id(),
                name: "Wren",
                description:
                    "Local. Grew up in the valley. Offers to be a guide and is clearly not doing it for money. Knows the terrain, knows the rules, and is keeping her real reason for helping very close.",
            },
            {
                id: id(),
                name: "Sheriff Daley",
                description:
                    "Officially closed the case. Hostile to outside interest. Scared in a way that presents as aggression. He knows more than the file shows and is deeply uncomfortable with the player's presence.",
            },
        ],
    },
    {
        id: "historical",
        name: "The Court of Fallen Stars",
        genre: "Historical Fiction",
        tagline: "Venice, 1612. A diplomat is dead. Your cipher was in his pocket.",
        description:
            "You are a translator at the Doge's court — a careful, useful, invisible position. Until now. Now your name is attached to a murder and the walls of the Palazzo are narrowing.",
        moods: ["intrigue", "elegant", "political"],
        icon: "castle",
        nsfw: false,
        synopsis:
            "The body was found in the canal before dawn. By the time the bells ring for prime you have been told, quietly, by someone you trust, that a page written in your cipher was found in his coat. You did not write it.",
        storyInstructions:
            "Rich period detail — dress, language, religion, the specific power structures of the Venetian Republic. The stakes are real: heresy, treason, and political rivalry are not abstract threats. Keep the intrigue layered and the alliances unstable. Anachronistic dialogue is strictly forbidden. Let characters speak with the formality and indirection of the period.",
        authorNotes:
            "The cipher was stolen three weeks ago — the player may not have noticed it missing. The diplomat was killed because of what he had found, not what he had done. The person who planted the cipher is in the room at almost every meeting, playing a long game that predates this murder by years.",
        storyOutline:
            "The discovery → protecting position at court → unpicking who had access to the cipher → the real target of the conspiracy → confrontation before the Council of Ten acts.",
        aiInstructions:
            "Write with the beauty and menace of the period. Venice itself should feel like a character — the light on the water, the smell of the canals, the specific architecture of power. Conversation is always a negotiation. Nobody says what they mean directly. Use period-appropriate expressions and avoid modern idiom entirely.",
        characters: [
            {
                id: id(),
                name: "Contessa Morosini",
                description:
                    "Your patroness. Ambitious, intelligent, and genuinely fond of you in the way powerful people are fond of useful things. Whether she is protecting you or managing you is a question worth considering.",
            },
            {
                id: id(),
                name: "Brother Luca",
                description:
                    "A monk attached to the court as a theological advisor. Your only reliable ally, and he has reasons of his own to want this resolved quietly. He knows more about the dead man than he has admitted.",
            },
            {
                id: id(),
                name: "Signor Ferro",
                description:
                    "A functionary in the Council of Ten's office. The man who told you about the cipher. Friendly. Meticulous. Has not yet told you who gave him the instruction to warn you.",
            },
        ],
    },
];
