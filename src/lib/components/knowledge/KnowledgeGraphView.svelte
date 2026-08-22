<script lang="ts">
	import type { KnowledgeConcept, KnowledgeState, KnowledgeTimelineEvent } from '$lib/types/domain';
	import ConceptBadge from '$lib/components/ui/ConceptBadge.svelte';
	import { Brain, History, ArrowRight } from 'lucide-svelte';

	let {
		conceptsWithState = [],
		timelineEvents = []
	}: {
		conceptsWithState: { concept: KnowledgeConcept; state: KnowledgeState }[];
		timelineEvents: KnowledgeTimelineEvent[];
	} = $props();

	let activeView = $state<'graph' | 'timeline'>('graph');
</script>

<div class="space-y-6">
	<!-- View Switcher -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">Concept Semantic Map & Timeline</h3>
			<p class="text-xs text-zinc-500 dark:text-zinc-400">Track your evolving knowledge state and prerequisite dependencies.</p>
		</div>

		<div class="flex rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 p-1 text-xs font-medium">
			<button
				type="button"
				onclick={() => (activeView = 'graph')}
				class="px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer {activeView === 'graph'
					? 'bg-orange-600 text-white font-semibold shadow-sm'
					: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
			>
				<Brain class="w-3.5 h-3.5" />
				<span>Concept Map</span>
			</button>
			<button
				type="button"
				onclick={() => (activeView = 'timeline')}
				class="px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer {activeView === 'timeline'
					? 'bg-orange-600 text-white font-semibold shadow-sm'
					: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
			>
				<History class="w-3.5 h-3.5" />
				<span>Evolution Timeline ({timelineEvents.length})</span>
			</button>
		</div>
	</div>

	{#if activeView === 'graph'}
		<!-- Concept Graph Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each conceptsWithState as item}
				<div class="studio-window rounded-2xl p-5 border border-[#e6e6e6] dark:border-white/[0.08] shadow-md flex flex-col justify-between gap-4">
					<div>
						<div class="flex items-center justify-between gap-2 mb-2">
							<span class="text-[10px] font-mono uppercase tracking-wider text-orange-800 dark:text-orange-300 bg-orange-100 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-300 dark:border-orange-500/20 font-bold">
								{item.concept.category}
							</span>
							<ConceptBadge state={item.state.state} score={item.state.masteryScore} />
						</div>

						<h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.concept.name}</h4>
						<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{item.concept.description}</p>
					</div>

					<div class="pt-3 border-t border-[#e6e6e6] dark:border-zinc-800/60 space-y-2 text-xs">
						<!-- Prerequisites -->
						{#if item.concept.prerequisites.length > 0}
							<div>
								<span class="text-[10px] font-mono text-zinc-500 block">Prerequisites:</span>
								<div class="flex flex-wrap gap-1 mt-0.5">
									{#each item.concept.prerequisites as pr}
										<span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
											↳ {pr}
										</span>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Mastery progress bar -->
						<div>
							<div class="flex justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
								<span>Mastery Score</span>
								<span class="font-bold text-orange-600 dark:text-orange-300">{item.state.masteryScore}%</span>
							</div>
							<div class="w-full h-1.5 rounded-full bg-[#e6e6e6] dark:bg-zinc-800 overflow-hidden">
								<div
									class="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
									style="width: {item.state.masteryScore}%"
								></div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<!-- Knowledge Timeline -->
		<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 shadow-lg space-y-4">
			{#if timelineEvents.length === 0}
				<div class="text-center py-10 text-xs text-zinc-500 font-mono">
					No state transitions recorded yet. Take a quiz or complete a teach-back session to start tracking!
				</div>
			{:else}
				<div class="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e0e0dc] dark:before:bg-zinc-800">
					{#each timelineEvents as event}
						<div class="relative">
							<!-- Timeline Dot -->
							<div class="absolute -left-6 top-1 w-3 h-3 rounded-full bg-orange-500 border-2 border-white dark:border-zinc-950"></div>

							<div class="p-4 rounded-xl bg-[#f7f7f5] dark:bg-zinc-900/60 border border-[#e0e0dc] dark:border-zinc-800 text-xs space-y-1">
								<div class="flex items-center justify-between flex-wrap gap-2">
									<strong class="text-zinc-900 dark:text-zinc-100 font-bold">{event.conceptName}</strong>
									<div class="flex items-center gap-1.5 font-mono text-[10px]">
										<ConceptBadge state={event.previousState} size="sm" />
										<span class="text-zinc-400">→</span>
										<ConceptBadge state={event.newState} size="sm" />
									</div>
								</div>

								<p class="text-zinc-600 dark:text-zinc-400 text-[11px] mt-1">{event.reason}</p>

								<div class="flex items-center justify-between pt-2 text-[10px] font-mono text-zinc-500">
									<span>Trigger: {event.triggerType}</span>
									<span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
