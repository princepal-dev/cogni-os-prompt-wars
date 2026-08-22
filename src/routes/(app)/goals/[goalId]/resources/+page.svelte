<script lang="ts">
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { CuratedResource } from '$lib/types/domain';

	let { data } = $props();

	let resources = $derived(data.resources as CuratedResource[]);

	const iconMap: Record<string, string> = {
		YOUTUBE_VIDEO: '📺',
		YOUTUBE_PLAYLIST: '▶️',
		ARTICLE: '📄',
		PRACTICE_PROBLEM: '⚡',
		DOCUMENTATION: '📖',
		COURSE: '🎓'
	};
</script>

<svelte:head>
	<title>Curated Resources — CognitiveOS</title>
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
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Curated Intelligence</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs text-zinc-400 font-mono">Ranked by Learner Context</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-100 font-display">Targeted Learning Resources</h1>
		</div>
	</div>

	<!-- Resources Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		{#each resources as res}
			<div class="studio-window rounded-2xl p-6 border border-zinc-800 shadow-md flex flex-col justify-between gap-4">
				<div>
					<div class="flex items-center justify-between gap-2 mb-2">
						<span class="text-[10px] font-mono uppercase text-orange-400 font-semibold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
							{res.conceptName}
						</span>
						<span class="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
							⏱️ {res.durationMinutes} min
						</span>
					</div>

					<div class="flex items-start gap-3 mt-2">
						<span class="text-2xl">{iconMap[res.type] || '📚'}</span>
						<div>
							<h3 class="text-sm font-bold text-zinc-100 leading-snug">{res.title}</h3>
							<span class="text-[11px] font-mono text-zinc-500">{res.type.replace('_', ' ')} • {res.level}</span>
						</div>
					</div>
				</div>

				<!-- Structured "Why this resource?" badges -->
				<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-1.5">
					<strong class="text-orange-300 block text-[11px] font-bold">✓ Recommended Because:</strong>
					<ul class="space-y-1 text-[11px] text-zinc-300">
						{#each res.whyRecommended as why}
							<li class="flex items-start gap-2">
								<span class="text-emerald-400 font-bold shrink-0">✓</span>
								<span>{why}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs">
					<span class="text-amber-400 font-mono text-[11px]">★ {res.rating.toFixed(1)} rating</span>
					<a
						href={res.url}
						target="_blank"
						rel="noreferrer"
						class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-sm transition-all"
					>
						Open Resource ↗
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
