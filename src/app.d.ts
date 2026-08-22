// See https://svelte.dev/docs/kit/types#app.d.ts
import type { User } from '$lib/types/domain';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
