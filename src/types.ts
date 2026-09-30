export type StylePresetId = "clean" | "study" | "academic" | "concise" | "custom";

export interface StylePreset {
	id: StylePresetId;
	name: string;
	description: string;
	instruction: string;
}

export interface GeminiStylerSettings {
	apiKey: string;
	model: string;
	selectedPreset: StylePresetId;
	customInstructions: string;
	preserveFrontmatter: boolean;
	temperature: number;
	cachedModels?: { id: string; name: string }[];
}

export const DEFAULT_SETTINGS: GeminiStylerSettings = {
	apiKey: "",
	model: "gemini-2.5-flash",
	selectedPreset: "clean",
	customInstructions: "Organize com títulos claros, tópicos bem distribuídos e corrija pontuação e ortografia mantendo o idioma original.",
	preserveFrontmatter: true,
	temperature: 0.2,
	cachedModels: []
};
