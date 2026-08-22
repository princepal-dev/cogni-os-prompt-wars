<script lang="ts">
	import { marked } from 'marked';
	import confetti from 'canvas-confetti';
	import type { Note } from '$lib/types/domain';
	import { Layers, Check, Sparkles, Lightbulb, Save, PenLine, Eye } from 'lucide-svelte';

	let {
		note,
		goalId,
		onSave
	}: {
		note: Note;
		goalId: string;
		onSave?: (savedNote: Note) => void;
	} = $props();

	let title = $state('');
	let content = $state('');
	let activeTab = $state<'edit' | 'preview'>('edit');
	let isSaving = $state(false);
	let isGeneratingCards = $state(false);
	let flashcardNotice = $state<string | null>(null);
	let extractedConcepts = $state<string[]>([]);
	let suggestedConnections = $state<{ conceptName: string; reason: string; connected: boolean }[]>([]);

	$effect(() => {
		title = note.title;
		content = note.markdownContent;
		extractedConcepts = note.extractedConcepts || [];
		suggestedConnections = note.suggestedConnections || [];
	});

	let renderedHtml = $derived(marked.parse(content || '*No content yet...*') as string);

	async function handleSave() {
		isSaving = true;
		try {
			const res = await fetch(`/api/notes/${goalId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: note.id,
					title,
					markdownContent: content
				})
			});
			const json = await res.json();
			if (json.success) {
				extractedConcepts = json.data.extractedConcepts;
				suggestedConnections = json.data.suggestedConnections;
				if (onSave) onSave(json.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSaving = false;
		}
	}

	async function generateFlashcards() {
		isGeneratingCards = true;
		flashcardNotice = null;
		try {
			const res = await fetch(`/api/flashcards/generate/${goalId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ noteId: note.id, content })
			});
			const json = await res.json();
			if (json.success) {
				flashcardNotice = `Generated ${json.data.length} flashcards from this note!`;
				try {
					confetti({ particleCount: 35, spread: 50 });
				} catch (e) {}
			}
		} catch (e) {
			console.error(e);
		} finally {
			isGeneratingCards = false;
		}
	}

	function connectConcept(idx: number) {
		suggestedConnections[idx].connected = true;
	}

	function ignoreConnection(idx: number) {
		suggestedConnections.splice(idx, 1);
	}
</script>

<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl space-y-4">
	<!-- Editor Header Controls -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6e6e6] dark:border-zinc-800">
		<input
			type="text"
			bind:value={title}
			placeholder="Note Title..."
			class="bg-transparent text-base font-bold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none font-display flex-1"
		/>

		<div class="flex items-center gap-2">
			<!-- Edit / Preview Tabs -->
			<div class="flex rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 p-0.5 text-xs font-medium">
				<button
					type="button"
					onclick={() => (activeTab = 'edit')}
					class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer {activeTab === 'edit'
						? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 font-semibold shadow-sm'
						: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
				>
					<PenLine class="w-3 h-3" />
					<span>Write</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'preview')}
					class="px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer {activeTab === 'preview'
						? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 font-semibold shadow-sm'
						: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
				>
					<Eye class="w-3 h-3" />
					<span>Preview</span>
				</button>
			</div>

			<!-- Generate Flashcards -->
			<button
				type="button"
				onclick={generateFlashcards}
				disabled={isGeneratingCards}
				class="px-3 py-1.5 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
				title="Extract AI flashcards from note contents"
			>
				<Layers class="w-3.5 h-3.5" />
				<span>{isGeneratingCards ? 'Generating...' : 'Make Cards'}</span>
			</button>

			<!-- Save Note Button -->
			<button
				type="button"
				onclick={handleSave}
				disabled={isSaving}
				class="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
			>
				<Save class="w-3.5 h-3.5" />
				<span>{isSaving ? 'Saving...' : 'Save'}</span>
			</button>
		</div>
	</div>

	<!-- Flashcard Banner Notification -->
	{#if flashcardNotice}
		<div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/30 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between animate-in fade-in duration-150">
			<span class="flex items-center gap-1.5">
				<Sparkles class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
				<span>{flashcardNotice}</span>
			</span>
			<button type="button" onclick={() => (flashcardNotice = null)} class="text-purple-700 dark:text-purple-400 hover:text-black dark:hover:text-purple-200 font-bold">✕</button>
		</div>
	{/if}

	<!-- Editor / Preview Area -->
	<div class="min-h-[260px]">
		{#if activeTab === 'edit'}
			<textarea
				bind:value={content}
				placeholder="Write your study notes in Markdown... (e.g. 'BFS uses a Queue because nodes are processed level by level. In contrast, DFS relies on recursion and the call stack.')"
				rows="12"
				class="w-full bg-[#fcfcfb] dark:bg-zinc-950/80 rounded-xl p-4 text-xs font-mono text-zinc-900 dark:text-zinc-200 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed resize-y"
			></textarea>
		{:else}
			<div class="p-4 rounded-xl bg-[#fcfcfb] dark:bg-zinc-950/50 border border-[#e0e0dc] dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-200 leading-relaxed space-y-2">
				{@html renderedHtml}
			</div>
		{/if}
	</div>

	<!-- AI Detected Concepts & Semantic Connections -->
	<div class="pt-3 border-t border-[#e6e6e6] dark:border-zinc-800/80 flex flex-col gap-3">
		{#if extractedConcepts.length > 0}
			<div class="flex items-center gap-2 flex-wrap text-xs">
				<span class="text-zinc-500 font-mono text-[11px]">Detected Concepts:</span>
				{#each extractedConcepts as concept}
					<span class="px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/50 border border-orange-300 dark:border-orange-700/50 text-orange-800 dark:text-orange-300 font-mono text-[10px]">
						#{concept}
					</span>
				{/each}
			</div>
		{/if}

		{#if suggestedConnections.length > 0}
			<div class="space-y-2">
				<span class="text-zinc-700 dark:text-zinc-400 font-semibold text-xs flex items-center gap-1.5">
					<Lightbulb class="w-3.5 h-3.5 text-amber-500" />
					<span>AI Suggested Concept Connections:</span>
				</span>
				{#each suggestedConnections as conn, idx}
					<div class="flex items-center justify-between p-2.5 rounded-lg bg-[#f7f7f5] dark:bg-zinc-900/60 border border-[#e0e0dc] dark:border-zinc-800 text-xs">
						<div>
							<strong class="text-zinc-900 dark:text-zinc-200 mr-2">{conn.conceptName}:</strong>
							<span class="text-zinc-600 dark:text-zinc-400 text-[11px]">{conn.reason}</span>
						</div>
						<div class="flex items-center gap-1.5 shrink-0 ml-3">
							{#if conn.connected}
								<span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
									<Check class="w-3 h-3" />
									<span>Connected</span>
								</span>
							{:else}
								<button
									type="button"
									onclick={() => connectConcept(idx)}
									class="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-600/30 hover:bg-orange-200 dark:hover:bg-orange-600/50 text-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-500/40 text-[10px] font-semibold cursor-pointer"
								>
									Connect
								</button>
								<button
									type="button"
									onclick={() => ignoreConnection(idx)}
									class="px-2 py-0.5 rounded bg-[#f0f0ee] dark:bg-zinc-800 hover:bg-[#e4e4e1] dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-[10px] cursor-pointer"
								>
									Ignore
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
