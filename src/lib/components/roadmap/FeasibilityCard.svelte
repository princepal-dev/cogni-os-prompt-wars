<script lang="ts">
	import type { FeasibilityAnalysis } from '$lib/types/domain';
	import { Activity, Clock, ArrowRight } from 'lucide-svelte';

	let { feasibility } = $props<{ feasibility: FeasibilityAnalysis }>();

	let selectedAlt = $state<'A' | 'B' | 'C' | 'D' | null>(null);

	const ratingConfig: Record<string, { label: string; color: string; badge: string }> = {
		REALISTIC: { label: 'Realistic', color: 'text-emerald-400', badge: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' },
		TIGHT: { label: 'Tight Schedule', color: 'text-amber-400', badge: 'bg-amber-950/60 border-amber-500/40 text-amber-300' },
		AGGRESSIVE: { label: 'Aggressive', color: 'text-orange-400', badge: 'bg-orange-950/60 border-orange-500/40 text-orange-300' },
		OVERAMBITIOUS: { label: 'Overambitious', color: 'text-rose-400', badge: 'bg-rose-950/60 border-rose-500/40 text-rose-300' }
	};

	const rating = $derived(ratingConfig[feasibility.rating] || ratingConfig.REALISTIC);
</script>

<div class="studio-window rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-5">
	<!-- Card Header -->
	<div class="flex items-center justify-between pb-3 border-b border-zinc-800/80">
		<div>
			<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Feasibility Reality Check</span>
			<h3 class="text-base font-bold text-zinc-100 font-display flex items-center gap-1.5 mt-0.5">
				<Activity class="w-4 h-4 text-orange-400" />
				<span>Goal Feasibility Analysis</span>
			</h3>
		</div>
		<span class="px-3 py-1 rounded-full border text-xs font-mono font-bold {rating.badge}">
			{rating.label}
		</span>
	</div>

	<!-- Hours Comparison Grid -->
	<div class="grid grid-cols-2 gap-3">
		<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-center">
			<span class="text-[10px] font-mono uppercase text-zinc-500 block">Available Time</span>
			<strong class="text-xl font-bold text-zinc-100 font-mono">{feasibility.availableLearningHours} hrs</strong>
		</div>
		<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-center">
			<span class="text-[10px] font-mono uppercase text-zinc-500 block">Estimated Required</span>
			<strong class="text-xl font-bold text-orange-400 font-mono">{feasibility.totalEstimatedHours} hrs</strong>
		</div>
	</div>

	<!-- Summary narrative -->
	<p class="text-xs text-zinc-300 leading-relaxed">
		{feasibility.summary}
	</p>

	<!-- Strategic Options A, B, C, D -->
	<div class="space-y-2 pt-2 border-t border-zinc-800/80">
		<span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
			Strategic Action Options:
		</span>

		<div class="grid grid-cols-1 gap-2">
			{#each feasibility.alternatives as alt}
				{@const isSelected = selectedAlt === alt.id}
				<button
					type="button"
					onclick={() => (selectedAlt = isSelected ? null : alt.id)}
					class="w-full text-left p-3 rounded-xl border transition-all text-xs cursor-pointer {isSelected
						? 'bg-orange-950/40 border-orange-500/60 shadow-sm'
						: 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'}"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono font-bold text-[10px] text-orange-300">
								{alt.id}
							</span>
							<strong class="text-zinc-200">{alt.title}</strong>
						</div>
						<span class="text-[10px] text-orange-400 font-mono flex items-center gap-1">
							<span>{isSelected ? 'Active' : 'Impact'}</span>
							<ArrowRight class="w-3 h-3" />
						</span>
					</div>

					{#if isSelected}
						<div class="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-300 space-y-1 animate-in fade-in duration-150">
							<p>{alt.description}</p>
							<p class="text-emerald-400 font-semibold font-mono">Impact: {alt.impactSummary}</p>
						</div>
					{/if}
				</button>
			{/each}
		</div>
	</div>
</div>
