import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import type GeminiStylerPlugin from "./main";
import { STYLE_PRESETS } from "./prompts";
import { GeminiService } from "./geminiService";
import { StylePresetId } from "./types";

export class GeminiStylerSettingTab extends PluginSettingTab {
	plugin: GeminiStylerPlugin;

	constructor(app: App, plugin: GeminiStylerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Configurações do Gemini Document Styler" });

		// Seção da Chave da API
		new Setting(containerEl)
			.setName("Chave da API do Google Gemini")
			.setDesc("Insira sua API Key obtida gratuitamente no Google AI Studio.")
			.addText(text => {
				text
					.setPlaceholder("Cole sua API Key aqui...")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					});
				text.inputEl.type = "password";

				// Botão de mostrar/ocultar senha
				const toggleBtn = text.inputEl.parentElement?.createEl("button", {
					text: "👁",
					cls: "clickable-icon",
					attr: { "aria-label": "Mostrar/Ocultar chave" }
				});
				if (toggleBtn) {
					toggleBtn.style.marginLeft = "8px";
					toggleBtn.addEventListener("click", (e) => {
						e.preventDefault();
						if (text.inputEl.type === "password") {
							text.inputEl.type = "text";
							toggleBtn.setText("🔒");
						} else {
							text.inputEl.type = "password";
							toggleBtn.setText("👁");
						}
					});
				}
			})
			.addButton(button => {
				button
					.setButtonText("Testar Conexão")
					.setCta()
					.onClick(async () => {
						button.setDisabled(true);
						button.setButtonText("Testando...");
						const res = await GeminiService.testConnection(
							this.plugin.settings.apiKey,
							this.plugin.settings.model
						);
						button.setDisabled(false);
						button.setButtonText("Testar Conexão");

						if (res.success) {
							new Notice(`✅ ${res.message}`);
						} else {
							new Notice(`❌ ${res.message}`, 8000);
							if (res.availableModels && res.availableModels.length > 0) {
								this.plugin.settings.cachedModels = res.availableModels;
								if (!res.availableModels.some(m => m.id === this.plugin.settings.model)) {
									this.plugin.settings.model = res.availableModels[0].id;
								}
								await this.plugin.saveSettings();
								this.display();
							}
						}
					});
			});

		const apiKeyHint = containerEl.createDiv({ cls: "gemini-styler-setting-desc-hint" });
		apiKeyHint.createEl("span", { text: "Precisa de uma chave? Obtenha uma gratuitamente em: " });
		apiKeyHint.createEl("a", {
			text: "Google AI Studio (aistudio.google.com)",
			href: "https://aistudio.google.com/app/apikey"
		});

		containerEl.createEl("h3", { text: "Parâmetros do Modelo e Estilização" });

		// Modelo do Gemini
		const modelSetting = new Setting(containerEl)
			.setName("Modelo do Gemini")
			.setDesc("Selecione o modelo do Gemini. Se desejar, clique no botão ao lado para carregar os modelos suportados pela sua chave.");

		modelSetting.addDropdown(dropdown => {
			// Modelos padrão confiáveis
			const defaultOptions: Record<string, string> = {
				"gemini-2.5-flash": "Gemini 2.5 Flash (Recomendado - Rápido)",
				"gemini-2.5-pro": "Gemini 2.5 Pro (Mais Inteligente)",
				"gemini-2.0-flash": "Gemini 2.0 Flash",
				"gemini-1.5-flash": "Gemini 1.5 Flash",
				"gemini-1.5-pro": "Gemini 1.5 Pro"
			};

			// Se houver modelos em cache obtidos diretamente da API do usuário, use-os
			if (this.plugin.settings.cachedModels && this.plugin.settings.cachedModels.length > 0) {
				for (const m of this.plugin.settings.cachedModels) {
					dropdown.addOption(m.id, m.name);
				}
			} else {
				for (const [id, label] of Object.entries(defaultOptions)) {
					dropdown.addOption(id, label);
				}
			}

			// Garantir que o valor selecionado existe no dropdown ou adicioná-lo
			const currentVal = this.plugin.settings.model || "gemini-2.0-flash";
			dropdown.setValue(currentVal);
			dropdown.onChange(async (value) => {
				this.plugin.settings.model = value;
				await this.plugin.saveSettings();
			});
		});

		modelSetting.addButton(btn => {
			btn
				.setButtonText("🔄 Buscar da Minha Conta")
				.setTooltip("Consulta a API com a sua chave para listar todos os modelos disponíveis para você")
				.onClick(async () => {
					if (!this.plugin.settings.apiKey?.trim()) {
						new Notice("⚠️ Insira sua chave de API antes de buscar os modelos.");
						return;
					}

					btn.setDisabled(true);
					btn.setButtonText("Buscando...");

					try {
						const models = await GeminiService.fetchAvailableModels(this.plugin.settings.apiKey);
						if (models.length > 0) {
							this.plugin.settings.cachedModels = models;
							// Se o modelo atual não estiver na lista, seleciona o primeiro compatível
							if (!models.some(m => m.id === this.plugin.settings.model)) {
								const preferred = models.find(m => m.id.includes("2.0-flash")) || models.find(m => m.id.includes("1.5-flash")) || models[0];
								this.plugin.settings.model = preferred.id;
							}
							await this.plugin.saveSettings();
							new Notice(`✅ ${models.length} modelos encontrados para a sua chave!`);
							this.display(); // Recarrega a tela de configurações para atualizar o dropdown
						} else {
							new Notice("Nenhum modelo com suporte a texto retornado pela API.");
						}
					} catch (e: any) {
						new Notice(`❌ Erro ao buscar modelos: ${e.message}`, 8000);
					} finally {
						btn.setDisabled(false);
						btn.setButtonText("🔄 Buscar da Minha Conta");
					}
				});
		});

		// Perfil de Estilo Padrão
		let previewEl: HTMLElement;

		new Setting(containerEl)
			.setName("Perfil de Estilo Padrão")
			.setDesc("Escolha a formatação que será aplicada ao disparar os comandos.")
			.addDropdown(dropdown => {
				for (const preset of STYLE_PRESETS) {
					dropdown.addOption(preset.id, preset.name);
				}
				dropdown
					.setValue(this.plugin.settings.selectedPreset)
					.onChange(async (value: StylePresetId) => {
						this.plugin.settings.selectedPreset = value;
						await this.plugin.saveSettings();
						this.updatePreview(previewEl, value);
					});
			});

		// Caixa de Preview da descrição do perfil
		previewEl = containerEl.createDiv({ cls: "gemini-styler-preview-box" });
		this.updatePreview(previewEl, this.plugin.settings.selectedPreset);

		// Instruções Customizadas / Prompt Adicional
		new Setting(containerEl)
			.setName("Instruções Adicionais / Prompt Customizado")
			.setDesc("Adicione diretrizes complementares para a formatação (ex: 'Sempre adicione uma lista de termos técnicos ao final').")
			.addTextArea(textArea => {
				textArea
					.setPlaceholder("Escreva instruções que deseja que a IA siga em cada estilização...")
					.setValue(this.plugin.settings.customInstructions)
					.onChange(async (value) => {
						this.plugin.settings.customInstructions = value;
						await this.plugin.saveSettings();
					});
				textArea.inputEl.rows = 4;
				textArea.inputEl.style.width = "100%";
			});

		containerEl.createEl("h3", { text: "Opções Avançadas" });

		// Preservar Frontmatter (YAML)
		new Setting(containerEl)
			.setName("Preservar Frontmatter (YAML)")
			.setDesc("Não envia os metadados do topo (---\\n...\\n---) para a IA, mantendo propriedades e tags intactas.")
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.preserveFrontmatter)
					.onChange(async (value) => {
						this.plugin.settings.preserveFrontmatter = value;
						await this.plugin.saveSettings();
					});
			});

		// Temperatura
		new Setting(containerEl)
			.setName("Criatividade / Temperatura")
			.setDesc("Valores mais baixos (ex: 0.1 a 0.3) garantem fidelidade absoluta à estrutura. Valores mais altos permitem maior reformulação textual.")
			.addSlider(slider => {
				slider
					.setLimits(0.0, 1.0, 0.05)
					.setValue(this.plugin.settings.temperature)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.temperature = value;
						await this.plugin.saveSettings();
					});
			});
	}

	private updatePreview(container: HTMLElement, presetId: StylePresetId): void {
		container.empty();
		const preset = STYLE_PRESETS.find(p => p.id === presetId);
		if (preset) {
			const badge = container.createSpan({ cls: "gemini-styler-tag", text: preset.name });
			badge.style.marginBottom = "6px";
			const desc = container.createEl("p", { text: preset.description });
			desc.style.margin = "6px 0 0 0";
		}
	}
}
