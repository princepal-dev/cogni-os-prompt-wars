<script lang="ts">
	import { createAiStatusQuery, queryKeys } from '$lib/query/queries';
	import { queryClient } from '$lib/query/client';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { Bot, Key, Zap, CheckCircle2 } from 'lucide-svelte';

	let aiQuery = createAiStatusQuery();
	let isKeyModalOpen = $state(false);
	let apiKeyInput = $state('');
	let isSaving = $state(false);

	async function handleSaveKey() {
		if (!apiKeyInput.trim()) return;
		isSaving = true;
		try {
			const res = await fetch('/api/ai/status', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ apiKey: apiKeyInput })
			});
			if (res.ok) {
				queryClient.invalidateQueries({ queryKey: queryKeys.aiStatus });
				isKeyModalOpen = false;
				apiKeyInput = '';
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSaving = false;
		}
	}
</script>

{#if aiQuery.data}
	{@const status = aiQuery.data}
	{#if !status.isOnline}
		<!-- Transparent Ada Offline Notice Card -->
		<div class="studio-window rounded-2xl p-5 border border-amber-300 dark:border-amber-500/20 bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-950/20 dark:via-zinc-900/90 dark:to-zinc-950/90 shadow-xl mb-6 text-black dark:text-zinc-100">
			<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div class="flex items-start gap-3.5">
					<div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 text-amber-600 dark:text-amber-400">
						<Bot class="w-5 h-5" />
					</div>
					<div class="space-y-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">Agent Status</span>
							<span class="text-zinc-400">•</span>
							<span class="text-xs font-bold text-zinc-900 dark:text-zinc-200">{status.agentName} (AI Learning Agent) is Offline</span>
						</div>
						<p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
							Ada is currently awaiting an OpenRouter API key. While we work on reconnecting the AI engine, you can seamlessly 
							<strong class="text-zinc-900 dark:text-zinc-100 font-semibold">revise your concepts with flashcards</strong>, 
							<strong class="text-zinc-900 dark:text-zinc-100 font-semibold">study notes in your Second Brain</strong>, and 
							<strong class="text-zinc-900 dark:text-zinc-100 font-semibold">take quizzes</strong> on existing materials.
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2 flex-wrap shrink-0">
					<button
						type="button"
						onclick={() => (isKeyModalOpen = true)}
						class="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
					>
						<Key class="w-3.5 h-3.5" />
						<span>Connect Ada</span>
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Ada Online Pill Header -->
		<div class="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-50 dark:bg-zinc-900/60 border border-emerald-300 dark:border-emerald-500/20 text-xs mb-6 text-emerald-900 dark:text-emerald-300">
			<div class="flex items-center gap-2">
				<span class="relative flex h-2 w-2">
					<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
					<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
				</span>
				<Bot class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
				<span class="text-xs font-bold text-zinc-900 dark:text-zinc-200">{status.agentName} AI Agent is Online</span>
				<span class="text-zinc-500 font-mono text-[11px]">({status.model})</span>
			</div>
			<button
				type="button"
				onclick={() => (isKeyModalOpen = true)}
				class="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 underline cursor-pointer"
			>
				Change API Key
			</button>
		</div>
	{/if}
{/if}

<!-- API Key Connection Modal -->
<Modal isOpen={isKeyModalOpen} onClose={() => (isKeyModalOpen = false)} title="Connect AI Agent 'Ada'">
	<div class="space-y-4">
		<p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
			Enter your OpenRouter API key to activate live reasoning, real-time diagnostic probing, Socratic teach-back evaluations, and note knowledge extraction with Ada.
		</p>

		<div>
			<label for="openrouter-key" class="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1">
				OpenRouter API Key:
			</label>
			<input
				id="openrouter-key"
				type="password"
				bind:value={apiKeyInput}
				placeholder="sk-or-v1-..."
				class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-mono"
			/>
			<span class="text-[11px] text-zinc-500 mt-1 block">
				Keys are stored securely in memory for the current session.
			</span>
		</div>

		<div class="flex items-center justify-end gap-2 pt-2">
			<button
				type="button"
				onclick={() => (isKeyModalOpen = false)}
				class="px-4 py-2 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleSaveKey}
				disabled={!apiKeyInput.trim() || isSaving}
				class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
			>
				<Key class="w-3.5 h-3.5" />
				<span>{isSaving ? 'Connecting...' : 'Activate Ada'}</span>
			</button>
		</div>
	</div>
</Modal>
