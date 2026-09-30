import { App, FuzzySuggestModal } from "obsidian";
import { StylePreset } from "./types";
import { STYLE_PRESETS } from "./prompts";

export class StyleSelectionModal extends FuzzySuggestModal<StylePreset> {
	private onChooseCallback: (preset: StylePreset) => void;

	constructor(app: App, onChooseCallback: (preset: StylePreset) => void) {
		super(app);
		this.onChooseCallback = onChooseCallback;
		this.setPlaceholder("Escolha o perfil de estilo para aplicar com o Gemini...");
	}

	getItems(): StylePreset[] {
		return STYLE_PRESETS;
	}

	getItemText(item: StylePreset): string {
		return `${item.name} - ${item.description}`;
	}

	onChooseItem(item: StylePreset, evt: MouseEvent | KeyboardEvent): void {
		this.onChooseCallback(item);
	}
}
