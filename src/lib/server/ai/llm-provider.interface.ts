// LLM Provider Interface for CognitiveOS

export interface LLMMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

export interface LLMCompletionOptions {
	temperature?: number;
	maxTokens?: number;
	responseFormat?: 'json_object' | 'text';
}

export interface LLMProvider {
	isAvailable(): boolean;
	complete(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<string>;
	completeJson<T = unknown>(messages: LLMMessage[], options?: LLMCompletionOptions): Promise<T>;
}
