<script lang="ts">
	import confetti from 'canvas-confetti';
	import type { DiagnosticQuestion, DiagnosticEvaluationResult } from '$lib/types/domain';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import { Briefcase, GraduationCap, Rocket, Trophy, Lightbulb, Video, Code, Zap, FileText, BarChart2, Layers, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-svelte';

	let step = $state<1 | 2 | 3>(1);

	// Step 1: Goal Configuration
	let title = $state('Graph Algorithms in DSA');
	let motivation = $state<'INTERVIEW' | 'EXAM' | 'COMPETITIVE_PROGRAMMING' | 'PROJECT' | 'CAREER' | 'PERSONAL_INTEREST'>('INTERVIEW');
	let targetOutcome = $state('Confidently solve medium/hard graph problems in coding interviews');
	let deadlineDays = $state(30);
	let dailyMinutes = $state(45);
	let studyDaysPerWeek = $state(5);
	let selectedPreferences = $state<string[]>(['VIDEOS', 'CODING', 'PRACTICE_PROBLEMS']);

	// Step 2: Diagnostic Probes
	let diagnosticQuestions = $state<DiagnosticQuestion[]>([]);
	let diagnosticAnswers = $state<Record<string, number>>({});
	let isLoadingDiagnostic = $state(false);

	// Step 3: Evaluation & Feasibility
	let evaluationResult = $state<DiagnosticEvaluationResult | null>(null);
	let isEvaluating = $state(false);
	let createdGoalId = $state<string | null>(null);

	const motivations = [
		{ id: 'INTERVIEW', label: 'Technical Interview Prep', icon: Briefcase },
		{ id: 'EXAM', label: 'College / Course Exam', icon: GraduationCap },
		{ id: 'PROJECT', label: 'Building a Real-World Project', icon: Rocket },
		{ id: 'COMPETITIVE_PROGRAMMING', label: 'Competitive Programming', icon: Trophy },
		{ id: 'PERSONAL_INTEREST', label: 'Personal Mastery', icon: Lightbulb }
	];

	const modalities = [
		{ id: 'VIDEOS', label: 'Visual Videos & Animations', icon: Video },
		{ id: 'CODING', label: 'Hands-on Code & Implementations', icon: Code },
		{ id: 'PRACTICE_PROBLEMS', label: 'Practice Problems (LeetCode style)', icon: Zap },
		{ id: 'READING', label: 'In-depth Articles & Textbooks', icon: FileText },
		{ id: 'DIAGRAMS', label: 'Architectural Diagrams', icon: BarChart2 },
		{ id: 'FLASHCARDS', label: 'Spaced Repetition Flashcards', icon: Layers }
	];

	function toggleModality(id: string) {
		if (selectedPreferences.includes(id)) {
			selectedPreferences = selectedPreferences.filter((p) => p !== id);
		} else {
			selectedPreferences = [...selectedPreferences, id];
		}
	}

	async function proceedToDiagnostic() {
		isLoadingDiagnostic = true;
		try {
			const res = await fetch('/api/diagnostic/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ topic: title })
			});
			const json = await res.json();
			if (json.success && json.data?.questions) {
				diagnosticQuestions = json.data.questions;
				step = 2;
			} else {
				step = 2;
			}
		} catch (e) {
			console.error(e);
			step = 2;
		} finally {
			isLoadingDiagnostic = false;
		}
	}

	async function submitDiagnosticAndCreateGoal() {
		isEvaluating = true;
		try {
			// 1. Create the Goal
			const goalRes = await fetch('/api/goals', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					motivation,
					targetOutcome,
					deadlineDays,
					dailyMinutesBudget: dailyMinutes,
					studyDaysPerWeek,
					preferences: selectedPreferences,
					priorKnowledge: 'Assessed via initial diagnostic'
				})
			});
			const goalJson = await goalRes.json();
			if (!goalJson.success) throw new Error(goalJson.error?.message || 'Goal creation failed');

			const goal = goalJson.data;
			createdGoalId = goal.id;

			// 2. Evaluate diagnostic answers against the new goal
			const answers = diagnosticQuestions.map((q) => ({
				questionId: q.id,
				conceptName: q.conceptName,
				selectedOptionIndex: diagnosticAnswers[q.id] ?? -1
			}));

			const evalRes = await fetch('/api/diagnostic/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					goalId: goal.id,
					goalTitle: title,
					answers
				})
			});
			const evalJson = await evalRes.json();
			if (evalJson.success) {
				evaluationResult = evalJson.data;
				step = 3;
				try {
					confetti({ particleCount: 70, spread: 60 });
				} catch (e) {}
			}
		} catch (e) {
			console.error(e);
		} finally {
			isEvaluating = false;
		}
	}
</script>

<svelte:head>
	<title>Create Learning Goal — CognitiveOS</title>
</svelte:head>

<div class="max-w-3xl mx-auto py-6 space-y-8 animate-in fade-in duration-200">
	<AiAgentBanner />

	<!-- Progress Header in macOS Studio Style -->
	<div class="studio-window rounded-2xl p-4 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-1.5">
				<span class="traffic-light-red"></span>
				<span class="traffic-light-yellow"></span>
				<span class="traffic-light-green"></span>
			</div>
			<div class="h-4 w-px bg-[#e6e6e6] dark:bg-zinc-800"></div>
			<h1 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">New Learning Journey Setup</h1>
		</div>
		<div class="flex items-center gap-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
			<span class={step === 1 ? 'text-orange-500 font-bold' : ''}>1. Goal</span>
			<span>→</span>
			<span class={step === 2 ? 'text-orange-500 font-bold' : ''}>2. Diagnostic</span>
			<span>→</span>
			<span class={step === 3 ? 'text-orange-500 font-bold' : ''}>3. Roadmap</span>
		</div>
	</div>

	<!-- STEP 1: GOAL CONFIGURATION -->
	{#if step === 1}
		<div class="studio-window rounded-2xl p-8 border border-[#e6e6e6] dark:border-zinc-800 space-y-6 shadow-2xl">
			<div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Step 1 of 3</span>
				<h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-display mt-0.5">What do you want to master?</h2>
				<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
					Define your target topic, motivation, and available daily study time.
				</p>
			</div>

			<!-- Topic Input -->
			<div>
				<label for="goal-topic-input" class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
					Learning Topic / Subject:
				</label>
				<input
					id="goal-topic-input"
					type="text"
					bind:value={title}
					placeholder="e.g. Graph Algorithms in DSA, Distributed Systems, Rust Systems Programming"
					class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
				/>
			</div>

			<!-- Target Outcome -->
			<div>
				<label for="goal-outcome-input" class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
					Target Outcome (What does success look like?):
				</label>
				<input
					id="goal-outcome-input"
					type="text"
					bind:value={targetOutcome}
					placeholder="e.g. Pass FAANG coding interviews, build a custom database engine"
					class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-4 py-3 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500"
				/>
			</div>

			<!-- Motivation Selection -->
			<div>
				<span class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
					Why do you want to learn this?
				</span>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
					{#each motivations as m}
						{@const isSelected = motivation === m.id}
						{@const MotivationIcon = m.icon}
						<button
							type="button"
							onclick={() => (motivation = m.id as any)}
							class="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer {isSelected
								? 'active-pill-orange border-orange-500 font-semibold'
								: 'bg-[#f7f7f5] dark:bg-zinc-950/80 border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}"
						>
							<MotivationIcon class="w-5 h-5 {isSelected ? 'text-white' : 'text-orange-500'}" />
							<div>
								<h3 class="text-xs font-bold">{m.label}</h3>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Time Constraints Grid -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
				<div>
					<label for="goal-days-input" class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
						Target Days:
					</label>
					<input
						id="goal-days-input"
						type="number"
						bind:value={deadlineDays}
						min="7"
						max="180"
						class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-mono"
					/>
				</div>

				<div>
					<label for="goal-minutes-input" class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
						Daily Minutes:
					</label>
					<input
						id="goal-minutes-input"
						type="number"
						bind:value={dailyMinutes}
						min="15"
						max="300"
						step="15"
						class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-mono"
					/>
				</div>

				<div>
					<label for="goal-days-per-week" class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
						Days / Week:
					</label>
					<input
						id="goal-days-per-week"
						type="number"
						bind:value={studyDaysPerWeek}
						min="1"
						max="7"
						class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-mono"
					/>
				</div>
			</div>

			<!-- Modalities -->
			<div>
				<span class="block text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2">
					Preferred Learning Modalities:
				</span>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
					{#each modalities as mod}
						{@const isChecked = selectedPreferences.includes(mod.id)}
						{@const ModIcon = mod.icon}
						<button
							type="button"
							onclick={() => toggleModality(mod.id)}
							class="flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer {isChecked
								? 'bg-orange-100 dark:bg-orange-950/40 border-orange-400 dark:border-orange-500/60 text-orange-900 dark:text-orange-200 font-semibold'
								: 'bg-[#f7f7f5] dark:bg-zinc-950/60 border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:border-zinc-400'}"
						>
							<ModIcon class="w-4 h-4 text-orange-500" />
							<span class="text-[11px] truncate">{mod.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Submit to Diagnostic -->
			<div class="pt-4 border-t border-[#e6e6e6] dark:border-zinc-800 flex justify-end">
				<button
					type="button"
					onclick={proceedToDiagnostic}
					disabled={!title.trim() || isLoadingDiagnostic}
					class="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md hover:shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
				>
					<span>{isLoadingDiagnostic ? 'Generating Diagnostic...' : 'Next: 2-Min Knowledge Diagnostic'}</span>
					<ArrowRight class="w-4 h-4" />
				</button>
			</div>
		</div>

	<!-- STEP 2: 4-QUESTION DIAGNOSTIC PROBE -->
	{:else if step === 2}
		<div class="studio-window rounded-2xl p-8 border border-[#e6e6e6] dark:border-zinc-800 space-y-6 shadow-2xl">
			<div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Step 2 of 3</span>
				<h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-display mt-0.5">Let's discover what you already know</h2>
				<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
					Answer these diagnostic reasoning questions so Ada estimates your starting concept states accurately.
				</p>
			</div>

			<div class="space-y-6 pt-2">
				{#each diagnosticQuestions as q, qIdx}
					<div class="p-5 rounded-xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e0e0dc] dark:border-zinc-800 space-y-3">
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold text-orange-500 font-mono">Q{qIdx + 1}</span>
							<span class="text-xs text-zinc-500 dark:text-zinc-400 font-mono">({q.conceptName})</span>
						</div>
						<h3 class="text-xs font-semibold text-zinc-900 dark:text-zinc-200 leading-relaxed">{q.questionText}</h3>

						<div class="space-y-2 mt-3">
							{#each q.options as opt, optIdx}
								{@const isSelected = diagnosticAnswers[q.id] === optIdx}
								<button
									type="button"
									onclick={() => (diagnosticAnswers[q.id] = optIdx)}
									class="w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer {isSelected
										? 'active-pill-orange border-orange-500 text-white font-semibold'
										: 'bg-white dark:bg-zinc-950 border-[#e0e0dc] dark:border-zinc-850 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400'}"
								>
									<span class="w-4 h-4 rounded-full border flex items-center justify-center font-mono text-[9px] shrink-0 mt-0.5 {isSelected
										? 'border-white bg-white/20 text-white'
										: 'border-zinc-400 dark:border-zinc-700 text-zinc-500'}">
										{String.fromCharCode(65 + optIdx)}
									</span>
									<span class="leading-relaxed text-[11px]">{opt}</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="pt-4 border-t border-[#e6e6e6] dark:border-zinc-800 flex items-center justify-between">
				<button
					type="button"
					onclick={() => (step = 1)}
					class="px-4 py-2 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 text-xs font-medium border border-[#e0e0dc] dark:border-zinc-800 flex items-center gap-1.5 cursor-pointer"
				>
					<ArrowLeft class="w-3.5 h-3.5" />
					<span>Back</span>
				</button>
				<button
					type="button"
					onclick={submitDiagnosticAndCreateGoal}
					disabled={isEvaluating}
					class="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
				>
					<span>{isEvaluating ? 'Analyzing Knowledge State & Building Roadmap...' : 'Finish & Generate Roadmap'}</span>
					<ArrowRight class="w-4 h-4" />
				</button>
			</div>
		</div>

	<!-- STEP 3: SUMMARY & LAUNCH -->
	{:else if step === 3 && evaluationResult}
		<div class="studio-window rounded-2xl p-8 border border-[#e6e6e6] dark:border-zinc-800 space-y-6 text-center shadow-2xl">
			<div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
				<Sparkles class="w-6 h-6" />
			</div>
			<h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-display">Personalized Roadmap Generated!</h2>
			<p class="text-xs text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
				{evaluationResult.diagnosticSummary}
			</p>

			<div class="p-4 rounded-xl bg-[#f7f7f5] dark:bg-zinc-950 border border-[#e0e0dc] dark:border-zinc-800 text-left space-y-2 max-w-lg mx-auto">
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 block">
					Initial Knowledge State Breakdown:
				</span>
				<div class="space-y-1.5">
					{#each evaluationResult.conceptStates as cs}
						<div class="flex items-center justify-between text-xs py-1 border-b border-[#e0e0dc] dark:border-zinc-800/50">
							<span class="text-zinc-800 dark:text-zinc-300">{cs.conceptName}</span>
							<span class="font-mono text-[11px] text-orange-600 dark:text-orange-300 font-semibold">{cs.state} ({cs.score}%)</span>
						</div>
					{/each}
				</div>
			</div>

			<div class="pt-4 flex justify-center gap-4">
				<a
					href={createdGoalId ? `/goals/${createdGoalId}/roadmap` : '/goals'}
					class="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md hover:shadow-orange-500/20 transition-all flex items-center gap-1.5"
				>
					<span>Open Personalized Roadmap</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>
		</div>
	{/if}
</div>
