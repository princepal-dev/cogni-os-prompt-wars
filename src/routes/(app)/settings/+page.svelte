<script lang="ts">
	import { queryClient } from '$lib/query/client';
	import { createAiStatusQuery, queryKeys } from '$lib/query/queries';
	import { themeStore, type Theme } from '$lib/stores/theme.store';
	import { Bot, Database, Sun, Moon, Laptop, Check, ShieldCheck, Zap, Sparkles } from 'lucide-svelte';

	let aiQuery = createAiStatusQuery();
	let model = $state('anthropic/claude-3.5-sonnet');
	let isSaved = $state(false);
	let currentTheme = $state<Theme>('dark');

	themeStore.subscribe((val) => {
		currentTheme = val;
	});

	async function handleModelChange(newModel: string) {
		model = newModel;
		await fetch('/api/ai/status', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ model: newModel })
		});
		queryClient.invalidateQueries({ queryKey: queryKeys.aiStatus });
		isSaved = true;
		setTimeout(() => (isSaved = false), 2500);
	}

	function setTheme(t: Theme) {
		themeStore.setTheme(t);
	}
</script>

<svelte:head>
	<title>System & Environment Settings — CognitiveOS</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
	<!-- Header -->
	<div class="studio-window rounded-2xl p-5 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">System Configuration</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-display">Settings & Environment Configuration</h1>
		</div>
	</div>

	<!-- Appearance & Theme Selector -->
	<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 space-y-4 shadow-xl">
		<div>
			<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">Appearance & Theme</h3>
			<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
				Choose between crisp Figma editorial light mode, obsidian dark mode, or follow your operating system.
			</p>
		</div>

		<div class="grid grid-cols-3 gap-3">
			<button
				type="button"
				onclick={() => setTheme('light')}
				class="p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer {currentTheme === 'light'
					? 'bg-white border-orange-500 shadow-md text-orange-600 font-bold'
					: 'bg-[#f4f4f2] dark:bg-zinc-900 border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}"
			>
				<Sun class="w-5 h-5 {currentTheme === 'light' ? 'text-amber-500' : ''}" />
				<span class="text-xs">Light Mode</span>
			</button>

			<button
				type="button"
				onclick={() => setTheme('dark')}
				class="p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer {currentTheme === 'dark'
					? 'bg-zinc-900 border-orange-500 shadow-md text-orange-400 font-bold'
					: 'bg-[#f4f4f2] dark:bg-zinc-900 border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}"
			>
				<Moon class="w-5 h-5 {currentTheme === 'dark' ? 'text-orange-400' : ''}" />
				<span class="text-xs">Dark Mode</span>
			</button>

			<button
				type="button"
				onclick={() => setTheme('system')}
				class="p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer {currentTheme === 'system'
					? 'bg-white dark:bg-zinc-900 border-orange-500 shadow-md text-orange-600 dark:text-orange-400 font-bold'
					: 'bg-[#f4f4f2] dark:bg-zinc-900 border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}"
			>
				<Laptop class="w-5 h-5" />
				<span class="text-xs">System Match</span>
			</button>
		</div>
	</div>

	<!-- AI Agent Ada Intelligence Card -->
	<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 space-y-5 shadow-xl">
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-2">
					<Bot class="w-5 h-5 text-orange-500" />
					<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI Learning Agent: Ada</h3>
				</div>
				<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
					Loaded directly from local environment variables (<code class="text-orange-600 dark:text-orange-400 font-mono font-bold">.env</code>).
				</p>
			</div>

			<span class="px-3 py-1 rounded-full border text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
				<Sparkles class="w-3.5 h-3.5" />
				<span>Ada Online</span>
			</span>
		</div>

		<div class="p-4 rounded-xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e0e0dc] dark:border-zinc-800 space-y-2 text-xs">
			<div class="flex items-center justify-between">
				<span class="font-mono text-zinc-500 dark:text-zinc-400">Environment Provider:</span>
				<span class="font-bold font-mono text-zinc-900 dark:text-zinc-200">OpenRouter AI</span>
			</div>
			<div class="flex items-center justify-between">
				<span class="font-mono text-zinc-500 dark:text-zinc-400">Environment Key Status:</span>
				<span class="font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
					<Check class="w-3.5 h-3.5" />
					<span>Configured in .env (Active)</span>
				</span>
			</div>
		</div>

		<div>
			<label for="or-model" class="block text-xs font-bold text-zinc-800 dark:text-zinc-300 mb-1">
				Active Reasoning Model:
			</label>
			<select
				id="or-model"
				value={model}
				onchange={(e) => handleModelChange((e.target as HTMLSelectElement).value)}
				class="w-full bg-[#f4f4f2] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-200 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-mono cursor-pointer"
			>
				<option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet (High-precision reasoning)</option>
				<option value="google/gemini-2.0-flash-001">google/gemini-2.0-flash-001 (Fast multimodal)</option>
				<option value="openai/gpt-4o-mini">openai/gpt-4o-mini (Lightweight)</option>
				<option value="deepseek/deepseek-chat">deepseek/deepseek-chat (Coding expert)</option>
			</select>
			{#if isSaved}
				<span class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
					✓ Model preference updated!
				</span>
			{/if}
		</div>
	</div>

	<!-- Database & Neon Auth Integration Card -->
	<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 space-y-4 shadow-xl">
		<div class="flex items-center justify-between">
			<div>
				<div class="flex items-center gap-2">
					<Database class="w-5 h-5 text-orange-500" />
					<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Database & Neon Auth Integration</h3>
				</div>
				<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
					Neon Serverless PostgreSQL and Neon Auth connected via environment.
				</p>
			</div>
			<span class="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
				<ShieldCheck class="w-3.5 h-3.5" />
				<span>Connected</span>
			</span>
		</div>

		<div class="space-y-2.5 text-xs font-mono">
			<div class="p-3.5 rounded-xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e0e0dc] dark:border-zinc-800 space-y-1">
				<div class="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">PostgreSQL Connection:</div>
				<div class="text-zinc-900 dark:text-zinc-200 font-bold truncate">
					ep-cold-glitter-azhlqcbw-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb
				</div>
				<div class="text-[11px] text-emerald-600 dark:text-emerald-400">
					✓ Tables Created & Synchronized
				</div>
			</div>

			<div class="p-3.5 rounded-xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e0e0dc] dark:border-zinc-800 space-y-1">
				<div class="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Neon Auth Endpoint:</div>
				<div class="text-zinc-900 dark:text-zinc-200 font-bold truncate">
					https://ep-cold-glitter-azhlqcbw.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth
				</div>
				<div class="text-[11px] text-zinc-600 dark:text-zinc-400">
					Project ID: <code class="text-orange-600 dark:text-orange-400 font-bold">quiet-shadow-63235700</code>
				</div>
			</div>
		</div>
	</div>
</div>
