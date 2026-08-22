import fs from 'node:fs';
import path from 'node:path';
import type { LLMProvider, LLMMessage, LLMCompletionOptions } from './llm-provider.interface';

function getEnvValue(key: string): string | null {
	if (process.env[key]) return process.env[key] as string;
	try {
		const envPath = path.resolve(process.cwd(), '.env');
		if (fs.existsSync(envPath)) {
			const content = fs.readFileSync(envPath, 'utf-8');
			for (const line of content.split('\n')) {
				const trimmed = line.trim();
				if (trimmed.startsWith(`${key}=`)) {
					return trimmed.slice(`${key}=`.length).trim().replace(/^["']|["']$/g, '');
				}
			}
		}
	} catch (e) {
		console.warn(`[OpenRouter] Error reading .env for ${key}:`, e);
	}
	return null;
}

export class OpenRouterLLMProvider implements LLMProvider {
	private apiKey: string;
	private model: string;
	private baseUrl: string = 'https://openrouter.ai/api/v1';

	constructor() {
		this.apiKey = getEnvValue('OPENROUTER_API_KEY') || '';
		this.model = getEnvValue('OPENROUTER_MODEL') || 'openrouter/free';
	}

	public getApiKey(): string {
		return getEnvValue('OPENROUTER_API_KEY') || this.apiKey || '';
	}

	public getModel(): string {
		return getEnvValue('OPENROUTER_MODEL') || this.model || 'openrouter/free';
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
			signal: AbortSignal.timeout(3000),
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
