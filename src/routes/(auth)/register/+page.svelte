<script lang="ts">
	import { goto } from '$app/navigation';
	import { Brain, Rocket, ArrowRight } from 'lucide-svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleRegister() {
		isSubmitting = true;
		errorMessage = null;
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});
			const json = await res.json();
			if (json.success) {
				goto('/login?registered=true');
			} else {
				errorMessage = json.error?.message || 'Registration failed';
			}
		} catch (e: any) {
			errorMessage = e.message;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create Free Account — CognitiveOS</title>
</svelte:head>

<div class="min-h-screen bg-white dark:bg-[#090a0b] text-black dark:text-zinc-100 flex flex-col justify-between selection:bg-[#dceeb1] transition-colors">
	<!-- Simple Top Bar -->
	<div class="p-6 max-w-6xl mx-auto w-full flex items-center justify-between">
		<a href="/" class="flex items-center gap-2">
			<span class="w-7 h-7 rounded-lg bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-sm">
				<Brain class="w-4 h-4" />
			</span>
			<span class="font-extrabold text-lg tracking-tight font-display text-black dark:text-white">CognitiveOS</span>
		</a>
		<a href="/login" class="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1">
			<span>Sign in</span>
			<ArrowRight class="w-3 h-3" />
		</a>
	</div>

	<!-- Main Register Card -->
	<div class="flex-1 flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-white dark:bg-[#121316] rounded-3xl p-8 border border-[#e6e6e6] dark:border-white/[0.08] shadow-xl space-y-6">
			<div class="text-center space-y-1">
				<div class="w-12 h-12 rounded-2xl bg-[#dceeb1] flex items-center justify-center mx-auto mb-3 shadow-sm text-black">
					<Rocket class="w-6 h-6" />
				</div>
				<h1 class="text-2xl font-bold text-black dark:text-white font-display">Create Your Account</h1>
				<p class="text-xs text-zinc-500 dark:text-zinc-400 font-light">Join CognitiveOS Personal Learning OS</p>
			</div>

			{#if errorMessage}
				<div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/50 text-xs text-rose-900 dark:text-rose-200 font-medium">
					{errorMessage}
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="space-y-4 text-left">
				<div>
					<label for="reg-name" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider font-mono">
						Full Name:
					</label>
					<input
						id="reg-name"
						type="text"
						bind:value={name}
						required
						placeholder="Jane Doe"
						class="w-full bg-[#f7f7f5] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
					/>
				</div>

				<div>
					<label for="reg-email" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider font-mono">
						Email Address:
					</label>
					<input
						id="reg-email"
						type="email"
						bind:value={email}
						required
						placeholder="name@example.com"
						class="w-full bg-[#f7f7f5] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
					/>
				</div>

				<div>
					<label for="reg-pass" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider font-mono">
						Password:
					</label>
					<input
						id="reg-pass"
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="w-full bg-[#f7f7f5] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="btn-primary-pill w-full py-3 text-xs justify-center"
				>
					{isSubmitting ? 'Creating Account...' : 'Get Started'}
				</button>
			</form>

			<div class="text-center text-xs text-zinc-600 dark:text-zinc-400 pt-2">
				Already have an account?
				<a href="/login" class="text-black dark:text-white font-bold underline ml-1">Sign In</a>
			</div>
		</div>
	</div>

	<!-- Minimal Footer -->
	<div class="p-6 text-center text-xs text-zinc-400 dark:text-zinc-600 font-mono">
		© 2026 CognitiveOS • Built for serious learners
	</div>
</div>
