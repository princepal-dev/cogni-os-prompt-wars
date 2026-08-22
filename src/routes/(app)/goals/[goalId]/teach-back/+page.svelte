<script lang="ts">
	import TeachBackConsole from '$lib/components/teach-back/TeachBackConsole.svelte';
	import type { TeachBackSession } from '$lib/types/domain';

	let { data } = $props();

	let sessions = $state<TeachBackSession[]>([]);

	$effect(() => {
		sessions = (data.sessions || []) as TeachBackSession[];
	});

	function onSessionFinished(newSession: TeachBackSession) {
		sessions = [newSession, ...sessions];
	}
</script>

<svelte:head>
	<title>Teach-Me AI Coach — CognitiveOS</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between pb-4 border-b border-zinc-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Socratic Coach</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs text-zinc-400 font-mono">Direct Assessment of Understanding</span>
			</div>
			<h1 class="text-2xl font-bold text-zinc-100 font-display">Teach-Back Mode</h1>
			<p class="text-xs text-zinc-400 mt-1 max-w-xl">
				Explaining a concept in your own words is the highest-signal test of understanding. The AI evaluates correctness, clarity, depth, and misconceptions.
			</p>
		</div>
	</div>

	<!-- Interactive Console -->
	<TeachBackConsole
		goalId={data.goal?.id || ''}
		onSessionCompleted={onSessionFinished}
	/>

	<!-- Past Sessions History -->
	{#if sessions.length > 0}
		<div class="glass-card rounded-2xl p-6 border border-zinc-800 shadow-lg space-y-4 max-w-3xl mx-auto">
			<h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
				Past Teach-Back Sessions ({sessions.length})
			</h3>

			<div class="space-y-3">
				{#each sessions as s}
					<div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-2">
						<div class="flex items-center justify-between">
							<strong class="text-zinc-200 text-sm font-bold">{s.conceptName}</strong>
							<span class="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
								Score: {s.score}/100
							</span>
						</div>

						<p class="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
							"{s.userExplanation}"
						</p>

						<div class="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
							<span>Clarity: {s.clarityScore}% • Correctness: {s.correctnessScore}%</span>
							<span>{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
