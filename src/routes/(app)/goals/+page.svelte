<script lang="ts">
	import type { LearningGoal } from '$lib/types/domain';
	import { Target, Plus, Clock, Brain, ArrowRight } from 'lucide-svelte';

	let { data } = $props();

	let goals = $derived((data.goals || []) as LearningGoal[]);
</script>

<svelte:head>
	<title>My Learning Goals — CognitiveOS</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e6e6] dark:border-zinc-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Target class="w-4 h-4 text-orange-500" />
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Goals Hub</span>
				<span class="text-xs text-zinc-400 dark:text-zinc-500">•</span>
				<span class="text-xs text-zinc-600 dark:text-zinc-400 font-mono">Personalized Curricula</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-display tracking-tight">
				My Learning Goals
			</h1>
			<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Track and manage your personalized adaptive learning journeys.</p>
		</div>

		<a
			href="/goals/new"
			class="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/25 transition-all self-start sm:self-auto cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>New Goal</span>
		</a>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each goals as goal}
			<div class="studio-window rounded-3xl p-6 border border-[#e6e6e6] dark:border-white/[0.08] shadow-xl flex flex-col justify-between gap-5 hover:border-orange-500/40 transition-colors">
				<div>
					<div class="flex items-center justify-between mb-2.5">
						<span class="text-[10px] font-mono uppercase tracking-wider text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full border border-orange-300 dark:border-orange-500/30 font-bold">
							{goal.motivation}
						</span>
						<span class="text-xs font-mono text-zinc-500 dark:text-zinc-400">Due: {goal.deadline}</span>
					</div>

					<h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">{goal.title}</h2>
					<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{goal.targetOutcome}</p>
				</div>

				<div class="pt-4 border-t border-[#e6e6e6] dark:border-zinc-800/80 flex items-center justify-between text-xs">
					<div class="flex items-center gap-3 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
						<span class="flex items-center gap-1">
							<Clock class="w-3 h-3 text-zinc-500" />
							<span>{goal.dailyMinutesBudget}m/day</span>
						</span>
						<span>•</span>
						<span class="flex items-center gap-1">
							<Brain class="w-3 h-3 text-orange-500" />
							<span>{goal.masteredConceptsCount}/{goal.totalConceptsCount} Mastered</span>
						</span>
					</div>

					<a
						href={`/goals/${goal.id}/roadmap`}
						class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1"
					>
						<span>Open Roadmap</span>
						<ArrowRight class="w-3.5 h-3.5" />
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
