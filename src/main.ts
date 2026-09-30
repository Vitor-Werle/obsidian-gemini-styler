import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, GeminiStylerSettings, StylePresetId } from "./types";
import { GeminiStylerSettingTab } from "./settings";
import { GeminiService } from "./geminiService";
import { StyleSelectionModal } from "./styleModal";

export default class GeminiStylerPlugin extends Plugin {
	settings: GeminiStylerSettings;
	private isProcessing: boolean = false;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Adiciona ícone na barra lateral (Ribbon)
		this.addRibbonIcon("sparkles", "Gemini Styler: Estilizar nota ativa", () => {
			const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (activeView) {
				this.styleEditorContent(activeView.editor, false);
			} else {
				new Notice("Nenhum documento Markdown aberto no momento.");
			}
		});

		// Adiciona a aba de configurações
		this.addSettingTab(new GeminiStylerSettingTab(this.app, this));

		// Comando 1: Estilizar nota inteira (perfil padrão)
		this.addCommand({
			id: "style-full-note",
			name: "Estilizar nota inteira (perfil padrão)",
			editorCallback: (editor: Editor) => {
				this.styleEditorContent(editor, false);
			}
		});

		// Comando 2: Estilizar texto selecionado (perfil padrão)
		this.addCommand({
			id: "style-selection",
			name: "Estilizar texto selecionado (perfil padrão)",
			editorCallback: (editor: Editor) => {
				this.styleEditorContent(editor, true);
			}
		});

		// Comando 3: Escolher perfil e estilizar nota inteira
		this.addCommand({
			id: "style-full-note-picker",
			name: "Escolher perfil e estilizar nota inteira",
			editorCallback: (editor: Editor) => {
				new StyleSelectionModal(this.app, (preset) => {
					this.styleEditorContent(editor, false, preset.id);
				}).open();
			}
		});

		// Comando 4: Escolher perfil e estilizar seleção
		this.addCommand({
			id: "style-selection-picker",
			name: "Escolher perfil e estilizar seleção",
			editorCallback: (editor: Editor) => {
				new StyleSelectionModal(this.app, (preset) => {
					this.styleEditorContent(editor, true, preset.id);
				}).open();
			}
		});
	}

	onunload(): void {
		// Limpeza se necessário
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	/**
	 * Processa e estiliza o conteúdo do editor via API do Gemini
	 */
	private async styleEditorContent(
		editor: Editor,
		onlySelection: boolean,
		specificPresetId?: StylePresetId
	): Promise<void> {
		if (this.isProcessing) {
			new Notice("Já existe uma solicitação de estilização em andamento. Aguarde...");
			return;
		}

		if (!this.settings.apiKey || this.settings.apiKey.trim() === "") {
			new Notice("⚠️ Chave de API do Gemini não configurada! Acesse as Opções do plugin para inserir sua chave.", 6000);
			return;
		}

		let originalText = "";
		if (onlySelection) {
			originalText = editor.getSelection();
			if (!originalText || originalText.trim() === "") {
				new Notice("Nenhum texto selecionado. Selecione um trecho ou use 'Estilizar nota inteira'.");
				return;
			}
		} else {
			originalText = editor.getValue();
			if (!originalText || originalText.trim() === "") {
				new Notice("A nota atual está vazia.");
				return;
			}
		}

		this.isProcessing = true;
		const loadingNotice = new Notice("✨ O Gemini está estilizando seu documento...", 0);

		try {
			const styledMarkdown = await GeminiService.formatText(
				originalText,
				this.settings,
				specificPresetId
			);

			if (onlySelection) {
				editor.replaceSelection(styledMarkdown);
			} else {
				// Preserva a posição do scroll ou cursor o máximo possível
				const cursor = editor.getCursor();
				editor.setValue(styledMarkdown);
				try {
					editor.setCursor(cursor);
				} catch {
					// Caso o tamanho do texto tenha mudado e o cursor seja inválido, ignora
				}
			}

			loadingNotice.hide();
			new Notice("✅ Documento estilizado com sucesso!");
		} catch (error: any) {
			loadingNotice.hide();
			const msg = error?.message || "Erro desconhecido ao comunicar com a API do Gemini.";
			new Notice(`❌ Falha na estilização: ${msg}`, 10000);
		} finally {
			this.isProcessing = false;
		}
	}
}
