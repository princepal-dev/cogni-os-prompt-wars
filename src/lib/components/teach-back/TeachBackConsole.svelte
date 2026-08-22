<script lang="ts">
	import confetti from 'canvas-confetti';
	import type { TeachBackSession } from '$lib/types/domain';
	import ConceptBadge from '$lib/components/ui/ConceptBadge.svelte';
	import { createAiStatusQuery } from '$lib/query/queries';
	import { Bot, Mic, Key, Zap, Check, AlertTriangle, Sparkles } from 'lucide-svelte';

	let {
		goalId,
		conceptName = 'Breadth-First Search (BFS)',
		onSessionCompleted
	}: {
		goalId: string;
		conceptName?: string;
		onSessionCompleted?: (session: TeachBackSession) => void;
	} = $props();

	let aiQuery = createAiStatusQuery();
	let selectedConcept = $state('Breadth-First Search (BFS)');
	let promptScenario = $state('Explain how BFS guarantees the shortest path in an unweighted graph, and why a Queue data structure is mandatory.');
	let userExplanation = $state('');
	let isEvaluating = $state(false);
	let sessionResult = $state<TeachBackSession | null>(null);
	let errorMessage = $state<string | null>(null);

	$effect(() => {
		if (conceptName) {
			selectedConcept = conceptName;
		}
	});

	const conceptPrompts: Record<string, string> = {
		'Breadth-First Search (BFS)': 'Explain how BFS guarantees the shortest path in an unweighted graph, and why a Queue data structure is mandatory.',
		'Depth-First Search (DFS)': 'Explain how recursive DFS explores paths, how the call stack acts as a LIFO structure, and why a visited set is required.',
		'Dijkstra & Shortest Paths': 'Explain Dijkstra’s algorithm to someone who already knows BFS, detailing how Min-Heaps and edge relaxation handle weights.',
		'Graph Representation': 'Explain the memory and lookup trade-offs between an Adjacency Matrix and an Adjacency List for sparse graphs.'
	};

	function handleConceptChange(name: string) {
		selectedConcept = name;
		promptScenario = conceptPrompts[name] || `Explain the core invariant and mechanism of ${name} clearly.`;
		sessionResult = null;
		errorMessage = null;
	}

	async function handleSubmit() {
		if (!userExplanation.trim()) return;
		isEvaluating = true;
		errorMessage = null;
		try {
			const res = await fetch('/api/teach-back/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					goalId,
					conceptName: selectedConcept,
					promptScenario,
					userExplanation
				})
			});
			const json = await res.json();
			if (json.success) {
				sessionResult = json.data;
				if (sessionResult && sessionResult.score >= 75) {
					try {
						confetti({ particleCount: 70, spread: 60 });
					} catch (e) {}
				}
				if (onSessionCompleted) onSessionCompleted(json.data);
			} else {
				errorMessage = json.error?.message || 'Ada is currently offline. Please configure your OpenRouter key in Settings.';
			}
		} catch (e: any) {
			errorMessage = e.message;
		} finally {
			isEvaluating = false;
		}
	}
</script>

<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl max-w-3xl mx-auto space-y-6">
	<!-- Concept Selector & Prompt Header -->
	<div class="pb-4 border-b border-[#e6e6e6] dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div>
			<div class="flex items-center gap-2">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Teach-Back Mode</span>
				<span class="text-xs text-zinc-400 dark:text-zinc-500">•</span>
				<span class="text-xs text-zinc-600 dark:text-zinc-400">Active Socratic Assessment with Ada</span>
			</div>
			<h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Teach the AI</h3>
		</div>

		<!-- Concept Selector -->
		<select
			value={selectedConcept}
			onchange={(e) => handleConceptChange((e.target as HTMLSelectElement).value)}
			class="bg-white dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-750 text-zinc-900 dark:text-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 cursor-pointer font-mono"
		>
			{#each Object.keys(conceptPrompts) as cName}
				<option value={cName}>{cName}</option>
			{/each}
		</select>
	</div>

	<!-- Socratic Prompt Scenario Box -->
	<div class="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/30 text-xs text-orange-950 dark:text-orange-200">
		<span class="font-bold text-orange-800 dark:text-orange-300 block mb-1 flex items-center gap-1.5">
			<Mic class="w-3.5 h-3.5" />
			<span>Teach Prompt from Ada:</span>
		</span>
		<p class="leading-relaxed font-mono">{promptScenario}</p>
	</div>

	<!-- Offline Notice Banner if Ada is offline -->
	{#if errorMessage}
		<div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
			<div class="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
				<Bot class="w-4 h-4" />
				<span>Ada Status:</span>
			</div>
			<p class="leading-relaxed">
				{errorMessage}
			</p>
			<div class="pt-1 flex items-center gap-2">
				<a href="/settings" class="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] flex items-center gap-1.5">
					<Key class="w-3 h-3" />
					<span>Connect OpenRouter API Key</span>
				</a>
				<a href={`/goals/${goalId}/flashcards`} class="px-3 py-1 rounded-lg bg-[#f0f0ee] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] flex items-center gap-1.5">
					<Zap class="w-3 h-3 text-orange-500" />
					<span>Revise Flashcards Instead</span>
				</a>
			</div>
		</div>
	{/if}

	<!-- Explanation Input -->
	<div>
		<label for="teach-explanation" class="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 mb-1.5">
			Your Explanation (Explain in your own words with concepts & mechanisms):
		</label>
		<textarea
			id="teach-explanation"
			bind:value={userExplanation}
			rows="7"
			placeholder="e.g. BFS works by taking the start node and pushing it into a FIFO queue. In each iteration, we pop the front node and visit all its unvisited neighbors, adding them to the queue and marking them visited in a set. Because it explores level by level..."
			class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl p-4 text-xs font-mono text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed resize-y"
		></textarea>
	</div>

	<!-- Submit Button -->
	<div class="flex items-center justify-between">
		<span class="text-[11px] text-zinc-500 font-mono">
			{userExplanation.trim().split(/\s+/).filter(Boolean).length} words
		</span>

		<button
			type="button"
			onclick={handleSubmit}
			disabled={!userExplanation.trim() || isEvaluating}
			class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md hover:shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
		>
			<Bot class="w-3.5 h-3.5" />
			<span>{isEvaluating ? 'Evaluating Socratic Understanding with Ada...' : 'Submit Explanation to Ada'}</span>
		</button>
	</div>

	<!-- Feedback Report -->
	{#if sessionResult}
		<div class="pt-6 border-t border-[#e6e6e6] dark:border-zinc-800 space-y-4 animate-in fade-in duration-200">
			<div class="flex items-center justify-between p-4 rounded-xl bg-[#f7f7f5] dark:bg-zinc-950/80 border border-[#e0e0dc] dark:border-zinc-800">
				<div>
					<span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Socratic Score</span>
					<div class="text-2xl font-bold text-orange-600 dark:text-orange-400 font-display">{sessionResult.score} / 100</div>
				</div>

				<div class="flex items-center gap-4 text-xs font-mono">
					<div>
						<span class="text-zinc-500 block text-[10px]">Clarity</span>
						<strong class="text-zinc-900 dark:text-zinc-200">{sessionResult.clarityScore}%</strong>
					</div>
					<div>
						<span class="text-zinc-500 block text-[10px]">Depth</span>
						<strong class="text-zinc-900 dark:text-zinc-200">{sessionResult.depthScore}%</strong>
					</div>
					<div>
						<span class="text-zinc-500 block text-[10px]">Correctness</span>
						<strong class="text-zinc-900 dark:text-zinc-200">{sessionResult.correctnessScore}%</strong>
					</div>
				</div>

				<div class="text-right">
					<span class="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">State Transition:</span>
					<div class="flex items-center gap-1">
						<ConceptBadge state={sessionResult.conceptStateBefore} size="sm" />
						<span class="text-zinc-400 text-xs">→</span>
						<ConceptBadge state={sessionResult.conceptStateAfter} size="sm" />
					</div>
				</div>
			</div>

			<!-- Coach Feedback -->
			<div class="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/30 text-xs text-orange-950 dark:text-orange-200">
				<strong class="text-orange-800 dark:text-orange-300 block mb-1 flex items-center gap-1.5">
					<Sparkles class="w-3.5 h-3.5" />
					<span>Ada's Coach Feedback:</span>
				</strong>
				<p class="leading-relaxed">{sessionResult.feedback}</p>
			</div>

			<!-- Strengths & Missing Concepts -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
				{#if sessionResult.strengths.length > 0}
					<div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/40 text-emerald-900 dark:text-emerald-200">
						<strong class="text-emerald-700 dark:text-emerald-300 block mb-1 flex items-center gap-1">
							<Check class="w-3.5 h-3.5" />
							<span>Demonstrated Strengths:</span>
						</strong>
						<ul class="space-y-1 list-disc list-inside text-[11px]">
							{#each sessionResult.strengths as st}
								<li>{st}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if sessionResult.missingConcepts.length > 0}
					<div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/40 text-amber-900 dark:text-amber-200">
						<strong class="text-amber-700 dark:text-amber-300 block mb-1 flex items-center gap-1">
							<AlertTriangle class="w-3.5 h-3.5" />
							<span>Missing Elements:</span>
						</strong>
						<ul class="space-y-1 list-disc list-inside text-[11px]">
							{#each sessionResult.missingConcepts as mc}
								<li>{mc}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
