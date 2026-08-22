<script lang="ts">
	import type { Flashcard } from '$lib/types/domain';
	import { Sparkles, RotateCw, Check, ArrowRight, Layers } from 'lucide-svelte';

	let {
		flashcards,
		goalId,
		onReviewed
	}: {
		flashcards: Flashcard[];
		goalId: string;
		onReviewed?: (card: Flashcard) => void;
	} = $props();

	let currentIdx = $state(0);
	let isFlipped = $state(false);
	let isSubmitting = $state(false);

	let currentCard = $derived(flashcards[currentIdx]);
	let hasFinished = $derived(currentIdx >= flashcards.length);

	async function rateCard(rating: 1 | 2 | 3 | 4) {
		if (!currentCard) return;
		isSubmitting = true;
		try {
			const res = await fetch(`/api/flashcards/${goalId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ flashcardId: currentCard.id, rating })
			});
			const json = await res.json();
			if (json.success) {
				if (onReviewed) onReviewed(json.data);
				isFlipped = false;
				currentIdx += 1;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="max-w-xl mx-auto space-y-6">
	{#if !hasFinished && currentCard}
		<!-- Deck Progress Header -->
		<div class="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono">
			<span class="px-2.5 py-1 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-orange-700 dark:text-orange-300 font-semibold">
				Card {currentIdx + 1} of {flashcards.length}
			</span>
			<span class="text-zinc-500">Topic: {currentCard.conceptName}</span>
		</div>

		<!-- Flashcard Box -->
		<button
			type="button"
			onclick={() => (isFlipped = !isFlipped)}
			class="w-full text-left min-h-[280px] p-8 rounded-2xl bg-white dark:bg-[#121316] border border-[#e6e6e6] dark:border-zinc-750 shadow-xl flex flex-col justify-between cursor-pointer hover:border-orange-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
		>
			<div class="flex items-center justify-between text-xs text-zinc-500 font-mono">
				<span class="px-2 py-0.5 rounded bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-[10px] font-bold">
					{isFlipped ? 'BACK (ANSWER)' : 'FRONT (PROMPT)'}
				</span>
				<span class="flex items-center gap-1">
					<RotateCw class="w-3 h-3" />
					<span>Click card to flip</span>
				</span>
			</div>

			<div class="my-6">
				{#if !isFlipped}
					<h3 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display leading-relaxed">
						{currentCard.front}
					</h3>
				{:else}
					<div class="text-sm text-orange-950 dark:text-orange-200 font-mono leading-relaxed bg-[#fcf8ee] dark:bg-zinc-950/60 p-4 rounded-xl border border-orange-200 dark:border-orange-500/30">
						{currentCard.back}
					</div>
				{/if}
			</div>

			<div class="text-[11px] text-zinc-500 font-mono">
				Interval: {currentCard.intervalDays}d • Reps: {currentCard.repetitions}
			</div>
		</button>

		<!-- SM-2 Rating Bar (Shown when flipped) -->
		{#if isFlipped}
			<div class="grid grid-cols-4 gap-2 pt-2 animate-in fade-in duration-150">
				<button
					type="button"
					onclick={() => rateCard(1)}
					disabled={isSubmitting}
					class="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50 text-xs font-bold transition-all cursor-pointer"
				>
					<span class="block text-[10px] opacity-70">1d</span>
					<span>Again (1)</span>
				</button>
				<button
					type="button"
					onclick={() => rateCard(2)}
					disabled={isSubmitting}
					class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 text-xs font-bold transition-all cursor-pointer"
				>
					<span class="block text-[10px] opacity-70">2d</span>
					<span>Hard (2)</span>
				</button>
				<button
					type="button"
					onclick={() => rateCard(3)}
					disabled={isSubmitting}
					class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50 text-xs font-bold transition-all cursor-pointer"
				>
					<span class="block text-[10px] opacity-70">4d</span>
					<span>Good (3)</span>
				</button>
				<button
					type="button"
					onclick={() => rateCard(4)}
					disabled={isSubmitting}
					class="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold transition-all cursor-pointer"
				>
					<span class="block text-[10px] opacity-70">7d</span>
					<span>Easy (4)</span>
				</button>
			</div>
		{/if}
	{:else}
		<div class="studio-window rounded-2xl p-10 text-center border border-[#e6e6e6] dark:border-zinc-800 space-y-4 shadow-xl">
			<div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
				<Sparkles class="w-6 h-6" />
			</div>
			<h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">Daily Deck Complete!</h3>
			<p class="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
				You reviewed all scheduled cards for today. Your memory retention intervals have been updated.
			</p>
			<button
				type="button"
				onclick={() => {
					currentIdx = 0;
					isFlipped = false;
				}}
				class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md cursor-pointer"
			>
				Review Again
			</button>
		</div>
	{/if}
</div>
