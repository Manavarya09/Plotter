export namespace main {
	
	export class ChatMessage {
	    role: string;
	    mode: string;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new ChatMessage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.role = source["role"];
	        this.mode = source["mode"];
	        this.content = source["content"];
	    }
	}
	export class ComfyConfig {
	    url: string;
	    model: string;
	    steps: number;
	    cfg: number;
	    width: number;
	    height: number;
	    negativePrompt: string;
	    workflowPath: string;
	    positiveNodeID: string;
	
	    static createFrom(source: any = {}) {
	        return new ComfyConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.model = source["model"];
	        this.steps = source["steps"];
	        this.cfg = source["cfg"];
	        this.width = source["width"];
	        this.height = source["height"];
	        this.negativePrompt = source["negativePrompt"];
	        this.workflowPath = source["workflowPath"];
	        this.positiveNodeID = source["positiveNodeID"];
	    }
	}
	export class ModelConfig {
	    aiInstructions: string;
	    storyInstructions: string;
	    authorNotes: string;
	
	    static createFrom(source: any = {}) {
	        return new ModelConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.aiInstructions = source["aiInstructions"];
	        this.storyInstructions = source["storyInstructions"];
	        this.authorNotes = source["authorNotes"];
	    }
	}
	export class OllamaModel {
	    name: string;
	    size: number;
	    parameterSize: string;
	    quantizationLevel: string;
	    family: string;
	
	    static createFrom(source: any = {}) {
	        return new OllamaModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.size = source["size"];
	        this.parameterSize = source["parameterSize"];
	        this.quantizationLevel = source["quantizationLevel"];
	        this.family = source["family"];
	    }
	}

}

export namespace store {
	
	export class Character {
	    id: string;
	    name: string;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new Character(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	    }
	}
	export class Session {
	    id: string;
	    storyId: string;
	    title: string;
	    // Go type: time
	    createdAt: any;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new Session(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.storyId = source["storyId"];
	        this.title = source["title"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.content = source["content"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Story {
	    id: string;
	    title: string;
	    genre: string;
	    synopsis: string;
	    status: string;
	    coverImage: string;
	    activeModel: string;
	    nsfw: boolean;
	    aiInstructions: string;
	    authorNotes: string;
	    storyOutline: string;
	    characters: Character[];
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Story(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.genre = source["genre"];
	        this.synopsis = source["synopsis"];
	        this.status = source["status"];
	        this.coverImage = source["coverImage"];
	        this.activeModel = source["activeModel"];
	        this.nsfw = source["nsfw"];
	        this.aiInstructions = source["aiInstructions"];
	        this.authorNotes = source["authorNotes"];
	        this.storyOutline = source["storyOutline"];
	        this.characters = this.convertValues(source["characters"], Character);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class UserTemplate {
	    id: string;
	    name: string;
	    genre: string;
	    tagline: string;
	    description: string;
	    moods: string[];
	    icon: string;
	    nsfw: boolean;
	    synopsis: string;
	    aiInstructions: string;
	    authorNotes: string;
	    storyOutline: string;
	    characters: Character[];
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new UserTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.genre = source["genre"];
	        this.tagline = source["tagline"];
	        this.description = source["description"];
	        this.moods = source["moods"];
	        this.icon = source["icon"];
	        this.nsfw = source["nsfw"];
	        this.synopsis = source["synopsis"];
	        this.aiInstructions = source["aiInstructions"];
	        this.authorNotes = source["authorNotes"];
	        this.storyOutline = source["storyOutline"];
	        this.characters = this.convertValues(source["characters"], Character);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

