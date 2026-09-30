import { GeminiStylerSettings, StylePresetId } from "./types";
import { BASE_SYSTEM_INSTRUCTION, STYLE_PRESETS } from "./prompts";

export class GeminiService {
	private static cleanMarkdownWrapper(rawText: string): string {
		let text = rawText.trim();

		// Se o modelo envolveu o texto inteiro em um bloco de código markdown ```markdown ... ```
		const markdownBlockMatch = text.match(/^```(?:markdown|md)?\r?\n([\s\S]*?)\r?\n```$/i);
		if (markdownBlockMatch) {
			text = markdownBlockMatch[1].trim();
		}

		return text;
	}

	public static async fetchAvailableModels(apiKey: string): Promise<{ id: string; name: string }[]> {
		if (!apiKey || apiKey.trim() === "") {
			throw new Error("Chave de API não informada.");
		}

		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`;
		const response = await fetch(endpoint);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			const msg = errorData?.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`;
			throw new Error(msg);
		}

		const data = await response.json();
		if (!data.models || !Array.isArray(data.models)) {
			return [];
		}

		return data.models
			.filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
			.map((m: any) => {
				const id = m.name.replace(/^models\//, "");
				const name = m.displayName ? `${m.displayName} (${id})` : id;
				return { id, name };
			});
	}

	public static async testConnection(apiKey: string, model: string): Promise<{ success: boolean; message: string; availableModels?: { id: string; name: string }[] }> {
		if (!apiKey || apiKey.trim() === "") {
			return { success: false, message: "A chave de API do Gemini não foi informada." };
		}

		const cleanModel = (model || "gemini-2.0-flash").replace(/^models\//, "").trim();
		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					contents: [
						{
							parts: [{ text: "Diga apenas a palavra OK." }]
						}
					]
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				const errorMsg = errorData?.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`;

				// Se realmente for 404 (modelo não existe), busca a lista para ajudar o usuário
				if (response.status === 404) {
					try {
						const models = await this.fetchAvailableModels(apiKey);
						if (models.length > 0 && !models.some(m => m.id === cleanModel)) {
							const sample = models.slice(0, 4).map(m => m.id).join(", ");
							return {
								success: false,
								message: `O modelo '${cleanModel}' não existe na sua conta. Modelos disponíveis: ${sample}... Use o botão 'Buscar da Minha Conta'.`,
								availableModels: models
							};
						}
					} catch {
						// Ignora e usa a mensagem de erro original
					}
				}

				return { success: false, message: `Erro da API Gemini (${response.status}): ${errorMsg}` };
			}

			return { success: true, message: `Conexão bem sucedida com o modelo '${cleanModel}'!` };
		} catch (error: any) {
			return {
				success: false,
				message: `Falha na requisição: ${error.message || "Erro de rede desconhecido."}`
			};
		}
	}

	public static async formatText(
		content: string,
		settings: GeminiStylerSettings,
		specificPresetId?: StylePresetId
	): Promise<string> {
		if (!settings.apiKey || settings.apiKey.trim() === "") {
			throw new Error("Chave da API do Gemini não configurada. Acesse as opções do plugin para inserir sua chave.");
		}

		if (!content || content.trim() === "") {
			throw new Error("O documento ou texto selecionado está vazio.");
		}

		// Preservar Frontmatter (YAML) se ativado nas configurações
		let frontmatter = "";
		let textToProcess = content;

		if (settings.preserveFrontmatter) {
			const frontmatterMatch = content.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n?)/);
			if (frontmatterMatch) {
				frontmatter = frontmatterMatch[1];
				textToProcess = content.substring(frontmatter.length);
			}
		}

		if (!textToProcess.trim()) {
			return content; // Se só havia frontmatter, nada a processar
		}

		const activePresetId = specificPresetId || settings.selectedPreset;
		const preset = STYLE_PRESETS.find(p => p.id === activePresetId) || STYLE_PRESETS[0];

		// Monta as instruções de estilo
		let styleDirectives = preset.instruction;
		if (activePresetId === "custom" || settings.customInstructions?.trim()) {
			if (activePresetId === "custom") {
				styleDirectives = settings.customInstructions || "Formate com clareza e organização.";
			} else if (settings.customInstructions?.trim()) {
				styleDirectives += `\n\nInstruções Adicionais do Usuário:\n${settings.customInstructions.trim()}`;
			}
		}

		const systemPrompt = `${BASE_SYSTEM_INSTRUCTION}\n\nDIRETRIZES DO ESTILO ATUAL:\n${styleDirectives}`;

		const cleanModel = (settings.model || "gemini-2.0-flash").replace(/^models\//, "").trim();
		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(settings.apiKey.trim())}`;

		const requestBody = {
			contents: [
				{
					role: "user",
					parts: [
						{
							text: `Por favor, reestruture e estilize o seguinte texto em Markdown seguindo rigorosamente as instruções:\n\n${textToProcess}`
						}
					]
				}
			],
			systemInstruction: {
				parts: [{ text: systemPrompt }]
			},
			generationConfig: {
				temperature: settings.temperature,
				maxOutputTokens: 8192
			}
		};

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			const errorMsg = errorData?.error?.message || `Erro HTTP ${response.status}: ${response.statusText}`;
			
			if (response.status === 401 || response.status === 403) {
				throw new Error(`Chave de API inválida ou sem permissão. Detalhes: ${errorMsg}`);
			} else if (response.status === 429) {
				throw new Error(`Limite de requisições excedido na API Gemini (Rate limit). Tente novamente em alguns segundos.`);
			} else {
				throw new Error(`Erro na API do Gemini: ${errorMsg}`);
			}
		}

		const data = await response.json();
		const candidate = data.candidates?.[0];

		if (!candidate) {
			throw new Error("Nenhum resultado retornado pela API do Gemini.");
		}

		// Filtrar partes com texto real (compatível com modelos Gemini 2.5 e de pensamento/thought)
		const parts = candidate.content?.parts || [];
		const nonThoughtParts = parts.filter((p: any) => p.text && !p.thought);
		const rawOutput = (nonThoughtParts.length > 0 ? nonThoughtParts : parts)
			.map((p: any) => p.text || "")
			.join("\n")
			.trim();

		if (!rawOutput) {
			const finishReason = candidate.finishReason;
			if (finishReason === "SAFETY") {
				throw new Error("A requisição foi bloqueada pelos filtros de segurança do Gemini.");
			}
			throw new Error("Nenhum conteúdo retornado pela API do Gemini.");
		}

		const generatedMarkdown = this.cleanMarkdownWrapper(rawOutput);

		// Reanexar o frontmatter original intacto, se houver
		if (frontmatter) {
			// Assegurar separação adequada entre frontmatter e corpo
			const separator = frontmatter.endsWith("\n") ? "" : "\n";
			return `${frontmatter}${separator}${generatedMarkdown}`;
		}

		return generatedMarkdown;
	}
}
