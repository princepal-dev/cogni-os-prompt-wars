<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Brain, ArrowRight, Lock, CheckCircle2 } from 'lucide-svelte';

	let { form } = $props();

	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);

	let isRegistered = $derived(page.url.searchParams.get('registered') === 'true');
	let errorMessage = $derived(form?.message as string | undefined);
</script>

<svelte:head>
	<title>Sign In — CognitiveOS</title>
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
		<a href="/register" class="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1">
			<span>Create account</span>
			<ArrowRight class="w-3 h-3" />
		</a>
	</div>

	<!-- Main Auth Card -->
	<div class="flex-1 flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-white dark:bg-[#121316] rounded-3xl p-8 border border-[#e6e6e6] dark:border-white/[0.08] shadow-xl space-y-6">
			<div class="text-center space-y-1">
				<div class="w-12 h-12 rounded-2xl bg-[#c5b0f4] flex items-center justify-center mx-auto mb-3 shadow-sm text-black">
					<Lock class="w-6 h-6" />
				</div>
				<h1 class="text-2xl font-bold text-black dark:text-white font-display">Sign In to CognitiveOS</h1>
				<p class="text-xs text-zinc-500 dark:text-zinc-400 font-light">Personal Adaptive Learning Intelligence OS</p>
			</div>

			{#if isRegistered}
				<div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 text-xs text-emerald-900 dark:text-emerald-200 font-medium flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
					<span>Account created successfully! Please sign in with your credentials.</span>
				</div>
			{/if}

			{#if errorMessage}
				<div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-700/50 text-xs text-rose-900 dark:text-rose-200 font-medium">
					{errorMessage}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="space-y-4 text-left"
			>
				<div>
					<label for="login-email" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wider font-mono">
						Email Address:
					</label>
					<input
						id="login-email"
						name="email"
						type="email"
						bind:value={email}
						required
						placeholder="name@example.com"
						class="w-full bg-[#f7f7f5] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
					/>
				</div>

				<div>
					<div class="flex items-center justify-between mb-1">
						<label for="login-pass" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono">
							Password:
						</label>
						<a href="/forgot-password" class="text-[11px] text-zinc-500 hover:text-orange-500 underline font-mono">
							Forgot password?
						</a>
					</div>
					<input
						id="login-pass"
						name="password"
						type="password"
						bind:value={password}
						required
						placeholder="••••••••"
						class="w-full bg-[#f7f7f5] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting || !email.trim() || !password}
					class="btn-primary-pill w-full py-3 text-xs justify-center cursor-pointer disabled:opacity-50"
				>
					{isSubmitting ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<div class="text-center text-xs text-zinc-600 dark:text-zinc-400 pt-2">
				Don't have an account?
				<a href="/register" class="text-black dark:text-white font-bold underline ml-1">Create Free Account</a>
			</div>
		</div>
	</div>

	<!-- Minimal Footer -->
	<div class="p-6 text-center text-xs text-zinc-400 dark:text-zinc-600 font-mono">
		© 2026 CognitiveOS • Built for serious learners
	</div>
</div>
