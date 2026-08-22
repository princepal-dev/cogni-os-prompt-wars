<script lang="ts">
	import DailyPlanWidget from '$lib/components/daily/DailyPlanWidget.svelte';
	import FeasibilityCard from '$lib/components/roadmap/FeasibilityCard.svelte';
	import ConceptBadge from '$lib/components/ui/ConceptBadge.svelte';

	let { data } = $props();

	let goal = $derived(data.goal);
</script>

<svelte:head>
	<title>{goal ? goal.title : 'Goal Overview'} — CognitiveOS</title>
</svelte:head>

<div class="space-y-6">
	{#if goal}
		<!-- Goal Header -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
			<div>
				<div class="flex items-center gap-2 mb-1">
					<span class="text-[10px] font-mono uppercase text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
						{goal.motivation}
					</span>
					<span class="text-xs text-zinc-500">•</span>
					<span class="text-xs font-mono text-zinc-400">Target: {goal.deadline}</span>
				</div>
				<h1 class="text-2xl font-bold text-zinc-100 font-display">{goal.title}</h1>
				<p class="text-xs text-zinc-400 mt-1">{goal.targetOutcome}</p>
			</div>

			<a
				href={`/goals/${goal.id}/roadmap`}
				class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto"
			>
				View Full Roadmap →
			</a>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
			<div class="lg:col-span-7">
				<DailyPlanWidget dailyPlan={data.dailyPlan} goalId={goal.id} />
			</div>
			<div class="lg:col-span-5 space-y-6">
				<FeasibilityCard feasibility={goal.feasibility} />
			</div>
		</div>

		<!-- Concept States Grid -->
		<div class="glass-card rounded-2xl p-6 border border-zinc-800 shadow-lg space-y-4">
			<h3 class="text-sm font-bold text-zinc-100">Concept States for this Goal</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				{#each data.conceptsWithState as item}
					<div class="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between gap-2">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-mono text-zinc-500 uppercase">{item.concept.category}</span>
							<ConceptBadge state={item.state.state} score={item.state.masteryScore} size="sm" />
						</div>
						<h4 class="text-xs font-bold text-zinc-200">{item.concept.name}</h4>
						<div class="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
							<div class="h-full bg-indigo-500 rounded-full" style="width: {item.state.masteryScore}%"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center py-20">
			<p class="text-xs font-mono text-zinc-400">Goal not found.</p>
		</div>
	{/if}
</div>
