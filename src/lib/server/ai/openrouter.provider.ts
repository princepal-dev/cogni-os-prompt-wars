// OpenRouter LLM Provider Implementation

import type { LLMProvider, LLMMessage, LLMCompletionOptions } from './llm-provider.interface';

export class OpenRouterLLMProvider implements LLMProvider {
	private apiKey: string;
	private model: string;
	private baseUrl: string = 'https://openrouter.ai/api/v1';

	constructor() {
		this.apiKey = process.env.OPENROUTER_API_KEY || '';
		this.model = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
	}

	public getApiKey(): string {
		return process.env.OPENROUTER_API_KEY || this.apiKey || '';
	}

	public getModel(): string {
		return process.env.OPENROUTER_MODEL || this.model || 'anthropic/claude-3.5-sonnet';
	}

	public isAvailable(): boolean {
		const key = this.getApiKey();
		return !!key && key.trim().length > 10;
	}

	public async complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<string> {
		if (!this.isAvailable()) {
			throw new Error('OpenRouter API key is not configured.');
		}

		const key = this.getApiKey();
		const model = this.getModel();

		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: 'POST',
			signal: AbortSignal.timeout(12000),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${key}`,
				'HTTP-Referer': 'https://cognitiveos.local',
				'X-Title': 'CognitiveOS'
			},
			body: JSON.stringify({
				model,
				messages: messages.map((m) => ({
					role: m.role,
					content: m.content
				})),
				temperature: options?.temperature ?? 0.3,
				max_tokens: options?.maxTokens ?? 2000,
				...(options?.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {})
			})
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
		}

		const data = (await response.json()) as any;
		return data.choices?.[0]?.message?.content || '';
	}

	public async completeJson<T = unknown>(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<T> {
		const raw = await this.complete(messages, {
			...options,
			responseFormat: 'json_object'
		});

		// Clean JSON code fences if returned by model
		let cleaned = raw.trim();
		if (cleaned.startsWith('```json')) {
			cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		} else if (cleaned.startsWith('```')) {
			cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
		}

		return JSON.parse(cleaned) as T;
	}
}

export const openRouterProvider = new OpenRouterLLMProvider();
