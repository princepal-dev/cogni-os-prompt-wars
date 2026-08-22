<script lang="ts">
	import QuizPlayer from '$lib/components/quiz/QuizPlayer.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { Quiz, QuizAttempt } from '$lib/types/domain';

	let { data } = $props();

	let activeQuiz = $state<Quiz | null>(null);
	let pastAttempts = $state<QuizAttempt[]>([]);
	let selectedMode = $state<'QUICK' | 'CONCEPT' | 'WEAK_AREA' | 'REVISION' | 'EXAM'>('CONCEPT');
	let isGenerating = $state(false);

	$effect(() => {
		activeQuiz = (data.quiz || null) as Quiz | null;
		pastAttempts = (data.pastAttempts || []) as QuizAttempt[];
	});

	async function switchMode(mode: 'QUICK' | 'CONCEPT' | 'WEAK_AREA' | 'REVISION' | 'EXAM') {
		selectedMode = mode;
		isGenerating = true;
		try {
			const res = await fetch(`/api/quiz/${data.goal?.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mode })
			});
			const json = await res.json();
			if (json.success) {
				activeQuiz = json.data;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isGenerating = false;
		}
	}

	function onAttemptFinished(attempt: QuizAttempt) {
		pastAttempts = [attempt, ...pastAttempts];
	}
</script>

<svelte:head>
	<title>Adaptive Quizzes — CognitiveOS</title>
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
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Assessment Engine</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs text-zinc-400 font-mono">Adaptive Question Weighting</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-100 font-display">Adaptive Quizzes & Exam Mode</h1>
		</div>

		<!-- Mode Switcher (Studio segmented control) -->
		<div class="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs font-medium overflow-x-auto">
			<button
				type="button"
				onclick={() => switchMode('CONCEPT')}
				class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer {selectedMode === 'CONCEPT'
					? 'bg-orange-600 text-white font-semibold'
					: 'text-zinc-400 hover:text-zinc-200'}"
			>
				Concept Quiz
			</button>
			<button
				type="button"
				onclick={() => switchMode('WEAK_AREA')}
				class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer {selectedMode === 'WEAK_AREA'
					? 'bg-orange-600 text-white font-semibold'
					: 'text-zinc-400 hover:text-zinc-200'}"
			>
				Weak Areas (60%)
			</button>
			<button
				type="button"
				onclick={() => switchMode('QUICK')}
				class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer {selectedMode === 'QUICK'
					? 'bg-orange-600 text-white font-semibold'
					: 'text-zinc-400 hover:text-zinc-200'}"
			>
				Quick 2-Min
			</button>
			<button
				type="button"
				onclick={() => switchMode('EXAM')}
				class="px-3 py-1.5 rounded-lg transition-colors cursor-pointer {selectedMode === 'EXAM'
					? 'bg-orange-600 text-white font-semibold'
					: 'text-zinc-400 hover:text-zinc-200'}"
			>
				Interview Mode
			</button>
		</div>
	</div>

	<!-- Quiz Player Box -->
	{#if isGenerating}
		<div class="studio-window rounded-2xl p-16 text-center border border-zinc-800 space-y-3">
			<div class="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto"></div>
			<p class="text-xs font-mono text-zinc-400">Prioritizing questions for your knowledge state...</p>
		</div>
	{:else if activeQuiz}
		<QuizPlayer
			quiz={activeQuiz}
			goalId={data.goal?.id || ''}
			onComplete={onAttemptFinished}
		/>
	{/if}

	<!-- Past Attempts & History -->
	{#if pastAttempts.length > 0}
		<div class="studio-window rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-4 max-w-3xl mx-auto">
			<h3 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
				Recent Quiz Attempts ({pastAttempts.length})
			</h3>
			<div class="space-y-2.5">
				{#each pastAttempts as attempt}
					<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs">
						<div>
							<div class="flex items-center gap-2">
								<span class="font-bold text-zinc-200">{attempt.percentage}% Score</span>
								<span class="text-zinc-500 font-mono text-[11px]">({attempt.score}/{attempt.maxScore} correct)</span>
							</div>
							<p class="text-zinc-400 text-[11px] mt-0.5">{attempt.feedback}</p>
						</div>
						<span class="text-[10px] font-mono text-zinc-500">
							{new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
