// Universal Typed API Client for CognitiveOS

export class ApiError extends Error {
	public code: string;
	public details?: unknown;
	public status: number;

	constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.code = code;
		this.status = status;
		this.details = details;
	}
}

export async function apiRequest<T = any>(
	path: string,
	options?: {
		method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
		body?: unknown;
		headers?: Record<string, string>;
	}
): Promise<T> {
	const method = options?.method || 'GET';
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options?.headers || {})
	};

	const config: RequestInit = {
		method,
		headers
	};

	if (options?.body !== undefined) {
		config.body = JSON.stringify(options.body);
	}

	const response = await fetch(path, config);
	const data = await response.json().catch(() => ({}));

	if (!response.ok || data.success === false) {
		throw new ApiError(
			data.error?.message || `Request failed with status ${response.status}`,
			data.error?.code || 'UNKNOWN_ERROR',
			response.status,
			data.error?.details
		);
	}

	return data.data !== undefined ? data.data : (data as T);
}
