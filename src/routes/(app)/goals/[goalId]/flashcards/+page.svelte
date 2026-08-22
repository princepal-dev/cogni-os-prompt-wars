<script lang="ts">
	import FlashcardViewer from '$lib/components/flashcards/FlashcardViewer.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { Flashcard } from '$lib/types/domain';

	let { data } = $props();

	let dueCards = $state<Flashcard[]>([]);
	let allCards = $state<Flashcard[]>([]);
	let activeTab = $state<'review' | 'all'>('review');

	$effect(() => {
		dueCards = (data.dueCards || []) as Flashcard[];
		allCards = (data.allCards || []) as Flashcard[];
	});

	function onCardReviewed(updated: Flashcard) {
		const idx = allCards.findIndex((c) => c.id === updated.id);
		if (idx >= 0) allCards[idx] = updated;
	}
</script>

<svelte:head>
	<title>Spaced Flashcards — CognitiveOS</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<AiAgentBanner />

	<!-- Header -->
	<div class="studio-window rounded-2xl p-5 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Memory Retention</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs text-zinc-400 font-mono">SuperMemo SM-2 Interval Engine</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-100 font-display">Spaced Repetition Flashcards</h1>
		</div>

		<!-- Tab Switcher (Segmented style) -->
		<div class="flex rounded-xl bg-zinc-950/80 border border-zinc-800 p-1 text-xs font-medium">
			<button
				type="button"
				onclick={() => (activeTab = 'review')}
				class="px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer {activeTab === 'review'
					? 'bg-orange-600 text-white font-semibold'
					: 'text-zinc-400 hover:text-zinc-200'}"
			>
				Due Review ({dueCards.length})
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'all')}
				class="px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer {activeTab === 'all'
					? 'bg-orange-600 text-white font-semibold'
					: 'text-zinc-400 hover:text-zinc-200'}"
			>
				All Cards ({allCards.length})
			</button>
		</div>
	</div>

	{#if activeTab === 'review'}
		<FlashcardViewer
			flashcards={dueCards.length > 0 ? dueCards : allCards}
			goalId={data.goal?.id || ''}
			onReviewed={onCardReviewed}
		/>
	{:else}
		<!-- All Cards Grid in Studio Window -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each allCards as card}
				<div class="studio-window rounded-2xl p-5 border border-zinc-800 shadow-md flex flex-col justify-between gap-3 text-xs">
					<div>
						<div class="flex items-center justify-between mb-2">
							<span class="text-[10px] font-mono uppercase text-orange-400 font-semibold">{card.conceptName}</span>
							<span class="text-[10px] font-mono text-zinc-500">Next due: {card.nextReviewDate}</span>
						</div>
						<h4 class="font-bold text-zinc-100">{card.front}</h4>
						<p class="text-zinc-300 mt-2 font-mono text-[11px] bg-zinc-950 p-3 rounded-xl border border-zinc-800">
							{card.back}
						</p>
					</div>

					<div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
						<span>Interval: {card.intervalDays} days</span>
						<span>Ease: {(card.easeFactor / 100).toFixed(2)}</span>
						<span>Reps: {card.repetitions}</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
