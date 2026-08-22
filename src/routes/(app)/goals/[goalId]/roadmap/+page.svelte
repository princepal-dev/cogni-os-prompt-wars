<script lang="ts">
	import RoadmapTimeline from '$lib/components/roadmap/RoadmapTimeline.svelte';
	import type { Roadmap, AdaptiveEvent } from '$lib/types/domain';
	import { Map, Zap, Sparkles, Clock } from 'lucide-svelte';

	let { data } = $props();

	let roadmap = $derived(data.roadmap as Roadmap);
	let adaptiveEvents = $derived(data.adaptiveEvents as AdaptiveEvent[]);
</script>

<svelte:head>
	<title>Roadmap — CognitiveOS</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e6e6] dark:border-zinc-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Map class="w-4 h-4 text-orange-500" />
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Dynamic Curriculum</span>
				<span class="text-xs text-zinc-400 dark:text-zinc-500">•</span>
				<span class="text-xs font-mono text-zinc-600 dark:text-zinc-400">Version {roadmap.version}</span>
				{#if roadmap.adaptationCount > 0}
					<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold flex items-center gap-1">
						<Zap class="w-3 h-3 text-orange-500" />
						<span>Adapted {roadmap.adaptationCount}x</span>
					</span>
				{/if}
			</div>
			<h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-display">{roadmap.title}</h1>
			<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">{roadmap.summary}</p>
		</div>

		<div class="text-right">
			<span class="text-[10px] font-mono text-zinc-500 block">Total Curriculum Time</span>
			<span class="text-base font-bold text-orange-600 dark:text-orange-400 font-mono">~{roadmap.totalEstimatedHours} hours</span>
		</div>
	</div>

	<!-- Active Adaptation Notice -->
	{#if roadmap.activeAdaptationNotice}
		<div class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-md">
			<Sparkles class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
			<div>
				<strong class="text-amber-800 dark:text-amber-300 block mb-0.5 font-bold">Dynamic Roadmap Adaptation Active:</strong>
				<p class="leading-relaxed">{roadmap.activeAdaptationNotice}</p>
			</div>
		</div>
	{/if}

	<!-- Roadmap Milestones Timeline -->
	<RoadmapTimeline {roadmap} />
</div>
