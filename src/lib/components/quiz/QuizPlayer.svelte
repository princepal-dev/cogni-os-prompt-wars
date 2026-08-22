<script lang="ts">
	import confetti from 'canvas-confetti';
	import type { Quiz, QuizAttempt } from '$lib/types/domain';
	import ConceptBadge from '$lib/components/ui/ConceptBadge.svelte';
	import { AlertTriangle, Check, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-svelte';

	let {
		quiz,
		goalId,
		onComplete
	}: {
		quiz: Quiz;
		goalId: string;
		onComplete?: (attempt: QuizAttempt) => void;
	} = $props();

	let currentQuestionIdx = $state(0);
	let selectedAnswers = $state<Record<string, number>>({});
	let isSubmitting = $state(false);
	let attemptResult = $state<QuizAttempt | null>(null);

	let currentQ = $derived(quiz.questions[currentQuestionIdx]);
	let isLastQuestion = $derived(currentQuestionIdx === quiz.questions.length - 1);
	let allAnswered = $derived(quiz.questions.every((q) => selectedAnswers[q.id] !== undefined));

	function selectOption(qId: string, optIdx: number) {
		selectedAnswers[qId] = optIdx;
	}

	async function handleSubmit() {
		isSubmitting = true;
		try {
			const answers = quiz.questions.map((q) => ({
				questionId: q.id,
				selectedOptionIndex: selectedAnswers[q.id] ?? -1
			}));

			const res = await fetch('/api/quiz/attempt', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					quizId: quiz.id,
					goalId,
					answers
				})
			});
			const json = await res.json();
			if (json.success) {
				attemptResult = json.data;
				if (attemptResult && attemptResult.percentage >= 75) {
					try {
						confetti({ particleCount: 80, spread: 70 });
					} catch (e) {}
				}
				if (onComplete) onComplete(json.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl max-w-3xl mx-auto">
	{#if !attemptResult}
		<!-- Active Quiz Runner -->
		<div class="flex items-center justify-between pb-4 border-b border-[#e6e6e6] dark:border-zinc-800">
			<div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Adaptive Quiz</span>
				<h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{quiz.title}</h3>
			</div>
			<div class="flex items-center gap-2">
				<span class="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
					Question {currentQuestionIdx + 1} of {quiz.questions.length}
				</span>
			</div>
		</div>

		<!-- Question Content -->
		<div class="py-6">
			<div class="flex items-center gap-2 mb-2">
				<span class="text-xs font-mono text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-500/20">
					{currentQ.conceptName}
				</span>
				<span class="text-xs text-zinc-500 font-mono">({currentQ.difficulty})</span>
			</div>

			<h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
				{currentQ.questionText}
			</h4>

			<!-- Options -->
			<div class="space-y-2.5 mt-5">
				{#each currentQ.options as option, idx}
					{@const isSelected = selectedAnswers[currentQ.id] === idx}
					<button
						type="button"
						onclick={() => selectOption(currentQ.id, idx)}
						class="w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer {isSelected
							? 'bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-950 dark:text-orange-100 shadow-sm font-semibold'
							: 'bg-[#fcfcfb] dark:bg-zinc-900/60 border-[#e0e0dc] dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-[#f7f7f5] dark:hover:bg-zinc-900'}"
					>
						<span class="w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5 {isSelected
							? 'border-orange-500 bg-orange-600 text-white font-bold'
							: 'border-[#d0d0cc] dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'}">
							{String.fromCharCode(65 + idx)}
						</span>
						<span class="leading-relaxed">{option}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Navigation Controls -->
		<div class="pt-4 border-t border-[#e6e6e6] dark:border-zinc-800 flex items-center justify-between">
			<button
				type="button"
				onclick={() => (currentQuestionIdx = Math.max(0, currentQuestionIdx - 1))}
				disabled={currentQuestionIdx === 0}
				class="px-3 py-1.5 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 border border-[#e0e0dc] dark:border-zinc-800 text-xs font-medium disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
			>
				<ArrowLeft class="w-3.5 h-3.5" />
				<span>Previous</span>
			</button>

			<div class="flex items-center gap-2">
				{#if !isLastQuestion}
					<button
						type="button"
						onclick={() => (currentQuestionIdx = Math.min(quiz.questions.length - 1, currentQuestionIdx + 1))}
						class="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
					>
						<span>Next</span>
						<ArrowRight class="w-3.5 h-3.5" />
					</button>
				{:else}
					<button
						type="button"
						onclick={handleSubmit}
						disabled={!allAnswered || isSubmitting}
						class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
					>
						<Check class="w-3.5 h-3.5" />
						<span>{isSubmitting ? 'Grading...' : 'Submit & Analyze'}</span>
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Results & Misconception Analysis -->
		<div class="space-y-6 animate-in fade-in duration-200">
			<div class="text-center py-4 border-b border-[#e6e6e6] dark:border-zinc-800">
				<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-500/40 text-2xl font-bold text-orange-600 dark:text-orange-300 mb-2 font-display">
					{attemptResult.percentage}%
				</div>
				<h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">
					{attemptResult.score} / {attemptResult.maxScore} Questions Correct
				</h3>
				<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-md mx-auto">{attemptResult.feedback}</p>
			</div>

			<!-- Concept Knowledge State Impact -->
			<div>
				<h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
					Knowledge State Evolution
				</h4>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each attemptResult.conceptBreakdown as cb}
						<div class="p-3 rounded-xl bg-[#f7f7f5] dark:bg-zinc-900/80 border border-[#e0e0dc] dark:border-zinc-800 flex items-center justify-between text-xs">
							<div>
								<span class="font-bold text-zinc-900 dark:text-zinc-200 block">{cb.conceptName}</span>
								<span class="text-[11px] text-zinc-500">{cb.correctCount}/{cb.totalCount} correct</span>
							</div>
							{#if cb.statusChangedTo}
								<ConceptBadge state={cb.statusChangedTo} />
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Misconceptions Identified -->
			{#if attemptResult.misconceptions.length > 0}
				<div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-700/40 text-xs text-rose-900 dark:text-rose-200">
					<h4 class="font-bold text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
						<AlertTriangle class="w-4 h-4" />
						<span>Detected Misconceptions:</span>
					</h4>
					<ul class="space-y-1.5 list-disc list-inside text-[11px] text-rose-800 dark:text-rose-300/90">
						{#each attemptResult.misconceptions as misc}
							<li>{misc}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="text-center pt-2">
				<button
					type="button"
					onclick={() => {
						attemptResult = null;
						currentQuestionIdx = 0;
						selectedAnswers = {};
					}}
					class="px-4 py-2 rounded-xl bg-[#f0f0ee] dark:bg-zinc-800 hover:bg-[#e4e4e1] dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-200 text-xs font-semibold border border-[#e0e0dc] dark:border-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
				>
					<RotateCcw class="w-3.5 h-3.5" />
					<span>Retake Quiz</span>
				</button>
			</div>
		</div>
	{/if}
</div>
