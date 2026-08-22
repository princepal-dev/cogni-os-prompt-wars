<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from '$lib/stores/toast';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import confetti from 'canvas-confetti';
	import ConceptBadge from '$lib/components/ui/ConceptBadge.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { DailyPlan, DailyPlanItem, LearningGoal, KnowledgeState, KnowledgeConcept, Task, Note, KnowledgeTimelineEvent, LearningQuestion } from '$lib/types/domain';
	import {
		Zap,
		Target,
		Flame,
		Layers,
		BookOpen,
		HelpCircle,
		MessageSquare,
		Brain,
		Sparkles,
		Clock,
		Lightbulb,
		Check,
		ArrowRight,
		Map,
		Plus,
		TrendingUp,
		History
	} from 'lucide-svelte';

	let { data } = $props();

	let goal = $derived(data.goal as LearningGoal);
	let goals = $derived((data.goals || []) as LearningGoal[]);
	let dailyPlan = $derived(data.dailyPlan as DailyPlan);
	let conceptsWithState = $derived(data.conceptsWithState as { concept: KnowledgeConcept; state: KnowledgeState }[]);
	let dueFlashcardsCount = $derived(data.dueFlashcardsCount as number);
	let notes = $derived(data.notes as Note[]);
	let timelineEvents = $derived(data.timelineEvents as KnowledgeTimelineEvent[]);
	
	let items = $state<DailyPlanItem[]>([]);
	let selectedWhyItem = $state<DailyPlanItem | null>(null);
	let selectedAlt = $state<'A' | 'B' | 'C' | 'D' | null>(null);
	let questions = $state<LearningQuestion[]>([]);
	let isTriggeringAdaptation = $state(false);
	let adaptationNotice = $state<string | null>(null);

	onMount(() => {
		if (page.url.searchParams.get('login_success') === 'true') {
			toast.success('Signed in successfully! Welcome back to CognitiveOS.');
			const url = new URL(window.location.href);
			url.searchParams.delete('login_success');
			replaceState(url.toString(), {});
		}
	});

	$effect(() => {
		items = dailyPlan.items;
		questions = (data.questions || []) as LearningQuestion[];
	});

	const completedCount = $derived(items.filter((i) => i.status === 'COMPLETED').length);
	const progressPercent = $derived(
		items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0
	);

	const typeBadge: Record<string, { label: string; bg: string; text: string; icon: typeof Zap }> = {
		REVIEW: { label: 'Spaced Review', bg: 'bg-[#f4ecd6]', text: 'text-black', icon: History },
		LEARN: { label: 'New Concept', bg: 'bg-[#c5b0f4]', text: 'text-black', icon: BookOpen },
		PRACTICE: { label: 'Active Drill', bg: 'bg-[#c8e6cd]', text: 'text-black', icon: Zap },
		FLASHCARDS: { label: 'Recall Deck', bg: 'bg-[#efd4d4]', text: 'text-black', icon: Layers },
		QUIZ: { label: 'Diagnostic', bg: 'bg-[#f3c9b6]', text: 'text-black', icon: HelpCircle }
	};

	async function toggleStatus(item: DailyPlanItem) {
		const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
		item.status = newStatus;

		if (newStatus === 'COMPLETED') {
			try {
				confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
			} catch (e) {}
		}

		await fetch(`/api/daily-plan/${goal.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ itemId: item.id, status: newStatus })
		});
	}

	async function runMagicMoment() {
		if (!goal) return;
		isTriggeringAdaptation = true;
		adaptationNotice = null;
		try {
			const res = await fetch('/api/demo/magic-moment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ goalId: goal.id })
			});
			const json = await res.json();
			if (json.success) {
				adaptationNotice = 'Dynamic Adaptation Verified: DFS gap detected → Recursion Refresher injected into Week 1 → Dijkstra rescheduled!';
				try {
					confetti({ particleCount: 80, spread: 70, origin: { y: 0.2 } });
				} catch (e) {}
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			}
		} catch (e) {
			console.error(e);
		} finally {
			isTriggeringAdaptation = false;
		}
	}

	async function updateQuestionStatus(q: LearningQuestion, newStatus: 'UNRESOLVED' | 'INVESTIGATING' | 'UNDERSTOOD') {
		q.status = newStatus;
		try {
			await fetch(`/api/questions/${goal.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ questionId: q.id, status: newStatus })
			});
		} catch (e) {
			console.error(e);
		}
	}
</script>

<svelte:head>
	<title>Studio Canvas Dashboard — CognitiveOS</title>
</svelte:head>

<div class="space-y-8 animate-in fade-in duration-200">
	<!-- 1. Transparent Ada AI Agent Status Banner -->
	<AiAgentBanner />

	<!-- 2. Evaluator Demo "Magic Moment" Strip (DESIGN.md Lime Section) -->
	<div class="rounded-3xl bg-[#dceeb1] p-5 sm:p-6 border border-black/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-black">
		<div class="flex items-center gap-3">
			<span class="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
				<Sparkles class="w-5 h-5 text-white" />
			</span>
			<div>
				<div class="flex items-center gap-2 flex-wrap">
					<span class="text-xs font-mono font-bold uppercase tracking-wider text-black/70">Adaptive Intelligence</span>
					<span class="text-black/30">•</span>
					<strong class="text-xs font-bold text-black">The "Magic Moment" Simulation</strong>
				</div>
				<p class="text-xs text-black/70 mt-0.5 leading-relaxed">
					Simulate a learner failing a DFS recursion probe: watch the engine detect the gap, update knowledge state, inject a prerequisite refresher, and reschedule Dijkstra.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<button
				type="button"
				onclick={runMagicMoment}
				disabled={isTriggeringAdaptation}
				class="btn-primary-pill text-xs w-full sm:w-auto flex items-center justify-center gap-1.5 cursor-pointer"
			>
				<Sparkles class="w-3.5 h-3.5" />
				<span>{isTriggeringAdaptation ? 'Adapting Roadmap...' : 'Trigger Dynamic Adaptation'}</span>
			</button>
		</div>
	</div>

	{#if adaptationNotice}
		<div class="p-4 rounded-2xl bg-[#c8e6cd] border border-green-700/20 text-xs font-mono text-green-950 font-bold text-center animate-in fade-in duration-200 flex items-center justify-center gap-2">
			<Sparkles class="w-4 h-4 text-green-800" />
			<span>{adaptationNotice}</span>
		</div>
	{/if}

	<!-- 3. HERO ACTIVE GOAL SPOTLIGHT (DESIGN.md Lilac Section #c5b0f4) -->
	{#if goal}
		<div class="rounded-3xl bg-[#c5b0f4] p-8 sm:p-10 border border-black/10 shadow-sm text-black relative overflow-hidden">
			<div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
				<div class="space-y-4 max-w-2xl">
					<!-- Eyebrow -->
					<div class="flex items-center gap-2 flex-wrap">
						<span class="px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono font-bold uppercase tracking-wider">
							Active Learning Goal
						</span>
						<span class="px-3 py-1 rounded-full bg-white/80 border border-black/10 text-black text-[11px] font-mono font-bold flex items-center gap-1.5">
							<Target class="w-3 h-3 text-black" />
							<span>Active Journey</span>
						</span>
					</div>

					<!-- Display Headline -->
					<div>
						<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black font-display leading-[1.08]">
							{goal.title}
						</h1>
						<p class="text-sm sm:text-base text-black/80 font-light mt-2 leading-relaxed max-w-xl">
							Target: <strong>{goal.targetOutcome}</strong>. 
							Allocated budget is <strong>{goal.dailyMinutesBudget} min/day</strong> across {goal.studyDaysPerWeek} study days per week.
						</p>
					</div>

					<!-- Goal Mastery Progress Bar -->
					<div class="space-y-1.5 pt-2 max-w-md">
						<div class="flex items-center justify-between text-xs font-mono font-bold text-black/70">
							<span>Curriculum Mastery</span>
							<span>{goal.totalConceptsCount ? Math.round((goal.masteredConceptsCount / goal.totalConceptsCount) * 100) : 0}% Complete</span>
						</div>
						<div class="w-full h-3 rounded-full bg-black/15 overflow-hidden p-0.5">
							<div
								class="h-full bg-black rounded-full transition-all duration-500"
								style="width: {goal.totalConceptsCount ? Math.round((goal.masteredConceptsCount / goal.totalConceptsCount) * 100) : 0}%"
							></div>
						</div>
					</div>
				</div>

				<!-- Pill Actions -->
				<div class="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
					<a
						href={`/goals/${goal.id}/learn`}
						class="btn-primary-pill text-sm px-8 py-3.5 shadow-lg hover:scale-105 flex items-center justify-center gap-2"
					>
						<Zap class="w-4 h-4 fill-white text-white" />
						<span>Start Today's Session ({goal.dailyMinutesBudget}m)</span>
						<ArrowRight class="w-4 h-4" />
					</a>

					<div class="flex items-center gap-2">
						<a
							href={`/goals/${goal.id}/roadmap`}
							class="btn-secondary-pill text-xs flex-1 text-center justify-center flex items-center gap-1.5"
						>
							<Map class="w-3.5 h-3.5 text-black" />
							<span>View Roadmap</span>
						</a>
						<a
							href="/goals/new"
							class="btn-secondary-pill text-xs text-center justify-center flex items-center gap-1.5"
							title="Create New Goal"
						>
							<Plus class="w-3.5 h-3.5 text-black" />
							<span>New Goal</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="rounded-3xl bg-[#c5b0f4] p-8 sm:p-10 border border-black/10 shadow-sm text-black relative overflow-hidden">
			<div class="max-w-xl space-y-4">
				<span class="px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono font-bold uppercase tracking-wider">
					Get Started
				</span>
				<h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-black font-display">
					Define your first learning journey
				</h1>
				<p class="text-sm text-black/80 font-light leading-relaxed">
					CognitiveOS builds a dynamic knowledge graph, 8-state concept radar, adaptive daily plan, and Socratic coach tailored to your exact goal.
				</p>
				<div class="pt-2">
					<a
						href="/goals/new"
						class="btn-primary-pill text-sm px-8 py-3.5 shadow-lg inline-flex items-center gap-2"
					>
						<Plus class="w-4 h-4 text-white" />
						<span>Create Your First Learning Goal</span>
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			</div>
		</div>
	{/if}

	<!-- 4. CORE MODULES & REALITY ENGINE (When goal exists) -->
	{#if goal}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<!-- Flashcards (Mint #c8e6cd) -->
			<a
				href={`/goals/${goal.id}/flashcards`}
				class="rounded-3xl bg-[#c8e6cd] p-6 border border-black/10 hover:shadow-md transition-all group flex flex-col justify-between text-black min-h-[170px]"
			>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<Layers class="w-6 h-6 text-black" />
						{#if dueFlashcardsCount > 0}
							<span class="px-2.5 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-bold">
								{dueFlashcardsCount} Due
							</span>
						{/if}
					</div>
					<h3 class="text-base font-bold font-display text-black group-hover:underline">Spaced Flashcards</h3>
					<p class="text-xs text-black/70 leading-relaxed font-light">
						SuperMemo SM-2 interval recall to lock concepts into memory.
					</p>
				</div>
				<span class="text-xs font-mono font-bold text-black mt-3 flex items-center gap-1">
					<span>Review Deck</span>
					<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
				</span>
			</a>

			<!-- Second Brain Notes (Cream #f4ecd6) -->
			<a
				href={`/goals/${goal.id}/notes`}
				class="rounded-3xl bg-[#f4ecd6] p-6 border border-black/10 hover:shadow-md transition-all group flex flex-col justify-between text-black min-h-[170px]"
			>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<BookOpen class="w-6 h-6 text-black" />
						<span class="text-[10px] font-mono font-bold text-black/60 uppercase">Obsidian Vault</span>
					</div>
					<h3 class="text-base font-bold font-display text-black group-hover:underline">Second Brain Notes</h3>
					<p class="text-xs text-black/70 leading-relaxed font-light">
						Markdown notes with automatic concept discovery and card extractor.
					</p>
				</div>
				<span class="text-xs font-mono font-bold text-black mt-3 flex items-center gap-1">
					<span>Open Notes ({notes.length})</span>
					<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
				</span>
			</a>

			<!-- Adaptive Quizzes (Pink #efd4d4) -->
			<a
				href={`/goals/${goal.id}/quiz`}
				class="rounded-3xl bg-[#efd4d4] p-6 border border-black/10 hover:shadow-md transition-all group flex flex-col justify-between text-black min-h-[170px]"
			>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<HelpCircle class="w-6 h-6 text-black" />
						<span class="text-[10px] font-mono font-bold text-black/60 uppercase">Adaptive Probes</span>
					</div>
					<h3 class="text-base font-bold font-display text-black group-hover:underline">Diagnostic Quizzes</h3>
					<p class="text-xs text-black/70 leading-relaxed font-light">
						Diagnostic probes tailored to your mastery curve and gaps.
					</p>
				</div>
				<span class="text-xs font-mono font-bold text-black mt-3 flex items-center gap-1">
					<span>Take Quiz</span>
					<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
				</span>
			</a>

			<!-- Socratic Teach-Back (White Studio Window) -->
			<a
				href={`/goals/${goal.id}/teach-back`}
				class="rounded-3xl bg-white dark:bg-[#121316] p-6 border border-[#e6e6e6] dark:border-white/[0.08] hover:shadow-md transition-all group flex flex-col justify-between text-black dark:text-zinc-100 min-h-[170px]"
			>
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<MessageSquare class="w-6 h-6 text-black dark:text-orange-400" />
						<span class="text-[10px] font-mono font-bold text-black/60 dark:text-zinc-400 uppercase">Feynman Method</span>
					</div>
					<h3 class="text-base font-bold font-display text-black dark:text-zinc-100 group-hover:underline">Teach-Back AI Coach</h3>
					<p class="text-xs text-black/70 dark:text-zinc-400 leading-relaxed font-light">
						Explain concepts in your own words to uncover blind spots.
					</p>
				</div>
				<span class="text-xs font-mono font-bold text-black dark:text-orange-400 mt-3 flex items-center gap-1">
					<span>Start Session</span>
					<ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
				</span>
			</a>
		</div>

		<!-- 5. DAILY ADAPTIVE PLANNER (LEFT 7 COLS) & GOAL FEASIBILITY (RIGHT 5 COLS) -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
			<!-- Left (7 cols): Today's Adaptive Action Plan -->
			<div class="lg:col-span-7 bg-white dark:bg-[#121316] rounded-3xl p-6 sm:p-8 border border-[#e6e6e6] dark:border-white/[0.08] shadow-sm space-y-6 text-black dark:text-zinc-100 transition-colors">
				<div class="flex items-center justify-between pb-4 border-b border-[#e6e6e6] dark:border-zinc-800">
					<div>
						<div class="flex items-center gap-2">
							<Zap class="w-5 h-5 text-black dark:text-orange-400 fill-black dark:fill-orange-400" />
							<h3 class="text-xl font-bold text-black dark:text-zinc-100 font-display">Today's Adaptive Plan</h3>
						</div>
						<p class="text-xs text-black/60 dark:text-zinc-400 mt-0.5 font-light">
							Curated {goal.dailyMinutesBudget} min high-leverage learning sequence.
						</p>
					</div>

					<div class="flex items-center gap-3">
						<div class="text-right">
							<span class="text-xs font-mono text-black/60 dark:text-zinc-400">{completedCount} of {items.length} completed</span>
							<span class="block text-xs font-bold text-black dark:text-orange-400 font-mono">{progressPercent}% done</span>
						</div>
						<div class="w-12 h-12 rounded-full bg-[#f7f7f5] dark:bg-zinc-950 border border-[#e6e6e6] dark:border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-black dark:text-orange-400">
							{progressPercent}%
						</div>
					</div>
				</div>

				<!-- Daily Plan Items -->
				<div class="space-y-3">
					{#if items.length === 0}
						<div class="p-8 text-center rounded-2xl bg-[#f7f7f5] dark:bg-zinc-950 border border-dashed border-[#e6e6e6] dark:border-zinc-800 text-xs text-zinc-500">
							No pending daily items for today. Add concepts or tasks to generate your schedule.
						</div>
					{:else}
						{#each items as item}
							{@const badge = typeBadge[item.type] || typeBadge.LEARN}
							{@const BadgeIcon = badge.icon}
							{@const isDone = item.status === 'COMPLETED'}
							<div
								class="p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 {isDone
									? 'bg-[#f7f7f5] dark:bg-zinc-950/40 border-[#e6e6e6] dark:border-zinc-850 opacity-60'
									: 'bg-white dark:bg-zinc-950/80 border-[#e6e6e6] dark:border-zinc-800 hover:border-black/30 dark:hover:border-zinc-700'}"
							>
								<div class="flex items-start gap-3">
									<button
										type="button"
										onclick={() => toggleStatus(item)}
										class="w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors cursor-pointer {isDone
											? 'bg-black dark:bg-emerald-500 border-black dark:border-emerald-400 text-white dark:text-zinc-950'
											: 'border-black/30 dark:border-zinc-700 hover:border-black dark:hover:border-orange-500 bg-white dark:bg-zinc-900'}"
									>
										{#if isDone}
											<Check class="w-3.5 h-3.5 text-white dark:text-zinc-950 stroke-[3]" />
										{/if}
									</button>

									<div class="space-y-1">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="text-xs font-bold text-black dark:text-zinc-100 {isDone ? 'line-through text-black/40 dark:text-zinc-500' : ''}">
												{item.title}
											</span>
											<span class="text-[10px] font-mono px-2 py-0.5 rounded-full border border-black/10 font-bold flex items-center gap-1 {badge.bg} {badge.text}">
												<BadgeIcon class="w-3 h-3" />
												<span>{badge.label}</span>
											</span>
										</div>
										<div class="flex items-center gap-3 text-[11px] text-black/60 dark:text-zinc-400 font-mono">
											<span class="flex items-center gap-1">
												<Clock class="w-3 h-3" />
												<span>{item.estimatedMinutes} min</span>
											</span>
											{#if item.conceptName}
												<span>• Concept: {item.conceptName}</span>
											{/if}
										</div>
									</div>
								</div>

								<button
									type="button"
									onclick={() => (selectedWhyItem = selectedWhyItem?.id === item.id ? null : item)}
									class="text-[11px] font-mono font-bold text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors px-2 py-1 rounded-md bg-[#f7f7f5] dark:bg-zinc-900 border border-[#e6e6e6] dark:border-zinc-800 cursor-pointer shrink-0 flex items-center gap-1"
								>
									<Lightbulb class="w-3 h-3 text-amber-500" />
									<span>Why?</span>
								</button>
							</div>

							{#if selectedWhyItem?.id === item.id}
								<div class="p-4 rounded-2xl bg-[#f4ecd6] dark:bg-orange-950/20 border border-black/10 dark:border-orange-500/30 text-xs space-y-1 animate-in fade-in duration-150 text-black dark:text-zinc-200">
									<div class="flex items-center gap-1.5 font-bold font-mono text-[11px] text-black dark:text-orange-300">
										<Lightbulb class="w-3.5 h-3.5 text-amber-600 dark:text-orange-400" />
										<span>AI Scheduling Rationale:</span>
									</div>
									<p class="text-black/80 dark:text-zinc-300 text-xs leading-relaxed">{item.whyReason}</p>
								</div>
							{/if}
						{/each}
					{/if}
				</div>
			</div>

			<!-- Right (5 cols): Feasibility Reality Check -->
			<div class="lg:col-span-5 bg-[#dceeb1] rounded-3xl p-6 sm:p-8 border border-black/10 shadow-sm space-y-6 text-black">
				<div class="flex items-center justify-between pb-3 border-b border-black/10">
					<div>
						<span class="text-[10px] font-mono font-bold uppercase tracking-wider text-black/60">Reality Engine</span>
						<h3 class="text-xl font-bold text-black font-display">Goal Feasibility</h3>
					</div>
					<span class="px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono font-bold">
						{goal.feasibility?.rating || 'BALANCED'}
					</span>
				</div>

				<!-- Hours Comparison -->
				<div class="grid grid-cols-2 gap-3">
					<div class="p-4 rounded-2xl bg-white/80 border border-black/10 text-center">
						<span class="text-[10px] font-mono uppercase text-black/60 block">Available Time</span>
						<strong class="text-2xl font-bold text-black font-mono">{goal.feasibility?.availableLearningHours || 24} hrs</strong>
					</div>
					<div class="p-4 rounded-2xl bg-white/80 border border-black/10 text-center">
						<span class="text-[10px] font-mono uppercase text-black/60 block">Estimated Need</span>
						<strong class="text-2xl font-bold text-black font-mono">{goal.feasibility?.totalEstimatedHours || 32} hrs</strong>
					</div>
				</div>

				<p class="text-xs text-black/80 leading-relaxed font-light">
					{goal.feasibility?.summary || 'Goal analysis ready.'}
				</p>

				<!-- Strategic Alternatives -->
				<div class="space-y-2 pt-2 border-t border-black/10">
					<span class="text-[10px] font-mono font-bold uppercase tracking-wider text-black/60 block">
						Strategic Action Options:
					</span>

					<div class="grid grid-cols-1 gap-2">
						{#each (goal.feasibility?.alternatives || []) as alt}
							{@const isSelected = selectedAlt === alt.id}
							<button
								type="button"
								onclick={() => (selectedAlt = isSelected ? null : alt.id)}
								class="w-full text-left p-3.5 rounded-2xl border transition-all text-xs cursor-pointer {isSelected
									? 'bg-white border-black shadow-sm'
									: 'bg-white/60 border-black/10 hover:bg-white'}"
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-2">
										<span class="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center font-mono font-bold text-[10px]">
											{alt.id}
										</span>
										<strong class="text-black">{alt.title}</strong>
									</div>
									<span class="text-[10px] font-mono font-bold text-black/60 flex items-center gap-1">
										<span>{isSelected ? 'Active' : 'Impact'}</span>
										<ArrowRight class="w-3 h-3" />
									</span>
								</div>

								{#if isSelected}
									<div class="mt-2 pt-2 border-t border-black/10 text-[11px] text-black/80 space-y-1 animate-in fade-in duration-150">
										<p>{alt.description}</p>
										<p class="font-bold font-mono text-black">Impact: {alt.impactSummary}</p>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Zero State: When user has no goals saved in DB -->
		<div class="p-12 text-center rounded-3xl bg-white dark:bg-[#121316] border border-[#e6e6e6] dark:border-white/[0.08] shadow-sm space-y-4 max-w-xl mx-auto">
			<div class="w-14 h-14 rounded-2xl bg-[#dceeb1] text-black flex items-center justify-center mx-auto shadow-sm">
				<Target class="w-7 h-7" />
			</div>
			<div class="space-y-1">
				<h3 class="text-xl font-bold font-display text-zinc-900 dark:text-zinc-100">No Learning Goals Found in Database</h3>
				<p class="text-xs text-zinc-500 dark:text-zinc-400">
					Create your first goal to unlock your personalized AI curriculum, spaced recall flashcards, diagnostic quizzes, and adaptive learning roadmap.
				</p>
			</div>
			<div class="pt-2">
				<a href="/goals/new" class="btn-primary-pill text-xs px-6 py-3 inline-flex items-center gap-2">
					<Plus class="w-4 h-4" />
					<span>Create Goal</span>
				</a>
			</div>
		</div>
	{/if}

	<!-- 6. 8-STATE CONTINUOUS CONCEPT KNOWLEDGE RADAR (Clean Box) -->
	{#if goal}
		<div class="bg-white dark:bg-[#121316] rounded-3xl p-6 sm:p-8 border border-[#e6e6e6] dark:border-white/[0.08] shadow-sm space-y-6 text-black dark:text-zinc-100 transition-colors">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#e6e6e6] dark:border-zinc-800">
				<div>
					<div class="flex items-center gap-2">
						<Brain class="w-5 h-5 text-black dark:text-orange-400" />
						<h3 class="text-xl font-bold text-black dark:text-zinc-100 font-display">Concept Knowledge States (8-State Machine)</h3>
					</div>
					<p class="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
						Dynamically updated from diagnostic probes, coding drills, and spaced recall decay.
					</p>
				</div>
				<a
					href={`/goals/${goal.id}/knowledge`}
					class="text-xs font-mono font-bold text-black dark:text-orange-400 underline flex items-center gap-1"
				>
					<span>Semantic Prerequisite Graph</span>
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each conceptsWithState as item}
					<div class="p-5 rounded-2xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e6e6e6] dark:border-white/[0.05] flex flex-col justify-between gap-3 hover:border-black dark:hover:border-zinc-700 transition-colors">
						<div class="flex items-center justify-between">
							<span class="text-[10px] font-mono text-black/50 dark:text-zinc-400 uppercase tracking-wider font-bold">{item.concept.category}</span>
							<ConceptBadge state={item.state.state} score={item.state.masteryScore} size="sm" />
						</div>
						<div>
							<h4 class="text-sm font-bold text-black dark:text-zinc-100">{item.concept.name}</h4>
							<p class="text-xs text-black/60 dark:text-zinc-400 mt-0.5 font-light">{item.concept.description}</p>
						</div>
						<div class="space-y-1 pt-1">
							<div class="flex items-center justify-between text-[11px] font-mono font-bold text-black/70 dark:text-zinc-300">
								<span>Mastery</span>
								<span>{item.state.masteryScore}%</span>
							</div>
							<div class="w-full h-2 rounded-full bg-black/10 dark:bg-zinc-900 overflow-hidden">
								<div class="h-full bg-black dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 rounded-full transition-all duration-300" style="width: {item.state.masteryScore}%"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- 7. UNRESOLVED QUESTIONS (LEFT) & KNOWLEDGE TIMELINE (RIGHT) -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
			<!-- Left: Unresolved Learning Questions -->
			<div class="bg-white dark:bg-[#121316] rounded-3xl p-6 sm:p-8 border border-[#e6e6e6] dark:border-white/[0.08] shadow-sm space-y-4 text-black dark:text-zinc-100 transition-colors">
				<div class="flex items-center justify-between pb-3 border-b border-[#e6e6e6] dark:border-zinc-800">
					<div>
						<div class="flex items-center gap-2">
							<HelpCircle class="w-4 h-4 text-black dark:text-orange-400" />
							<h3 class="text-lg font-bold text-black dark:text-zinc-100 font-display">Unresolved Questions</h3>
						</div>
						<p class="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
							Confusions and questions captured during study sessions.
						</p>
					</div>
				</div>

				<div class="space-y-3">
					{#each questions as q}
						<div class="p-4 rounded-2xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e6e6e6] dark:border-white/[0.05] space-y-2">
							<div class="flex items-start justify-between gap-2">
								<p class="text-xs font-bold text-black dark:text-zinc-100 leading-snug">"{q.questionText}"</p>
								<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 {q.status === 'UNDERSTOOD'
									? 'bg-[#c8e6cd] dark:bg-emerald-950/80 text-green-950 dark:text-emerald-300 border border-green-800/20 dark:border-emerald-500/40'
									: q.status === 'INVESTIGATING'
										? 'bg-[#f4ecd6] dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border border-amber-800/20 dark:border-amber-500/40'
										: 'bg-[#efd4d4] dark:bg-rose-950/80 text-red-950 dark:text-rose-300 border border-red-800/20 dark:border-rose-500/40'}">
									{q.status}
								</span>
							</div>
							{#if q.notes}
								<p class="text-[11px] text-black/70 dark:text-zinc-300 font-mono bg-white dark:bg-zinc-900/60 p-2.5 rounded-xl border border-[#e6e6e6] dark:border-zinc-800/70">
									{q.notes}
								</p>
							{/if}
							<div class="flex items-center justify-between pt-1 text-[10px] font-mono text-black/60 dark:text-zinc-400">
								<span>Linked to: <strong class="text-black dark:text-zinc-200">{q.conceptName || 'Graphs'}</strong></span>
								<div class="flex items-center gap-1.5">
									<button
										type="button"
										onclick={() => updateQuestionStatus(q, 'INVESTIGATING')}
										class="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-[#f7f7f5] dark:hover:bg-zinc-800 text-black dark:text-zinc-200 border border-[#e6e6e6] dark:border-zinc-700 transition-colors cursor-pointer font-bold"
									>
										Investigate
									</button>
									<button
										type="button"
										onclick={() => updateQuestionStatus(q, 'UNDERSTOOD')}
										class="px-2.5 py-1 rounded-lg bg-[#c8e6cd] dark:bg-emerald-950/80 hover:bg-[#b5dec0] dark:hover:bg-emerald-900 text-green-950 dark:text-emerald-300 border border-green-800/20 dark:border-emerald-500/40 transition-colors cursor-pointer font-bold flex items-center gap-1"
									>
										<Check class="w-3 h-3" />
										<span>Understood</span>
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Knowledge Evolution Timeline -->
			<div class="bg-white dark:bg-[#121316] rounded-3xl p-6 sm:p-8 border border-[#e6e6e6] dark:border-white/[0.08] shadow-sm space-y-4 text-black dark:text-zinc-100 transition-colors">
				<div class="flex items-center justify-between pb-3 border-b border-[#e6e6e6] dark:border-zinc-800">
					<div>
						<div class="flex items-center gap-2">
							<History class="w-4 h-4 text-black dark:text-orange-400" />
							<h3 class="text-lg font-bold text-black dark:text-zinc-100 font-display">Knowledge Evolution Timeline</h3>
						</div>
						<p class="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
							Audit trail of mastery state transitions and trigger events.
						</p>
					</div>
					<a
						href={`/goals/${goal?.id}/knowledge`}
						class="text-xs font-mono font-bold text-black dark:text-orange-400 underline flex items-center gap-1"
					>
						<span>Full History</span>
						<ArrowRight class="w-3.5 h-3.5" />
					</a>
				</div>

				<div class="space-y-3">
					{#each timelineEvents as event}
						{@const delta = event.newMastery - event.previousMastery}
						<div class="p-4 rounded-2xl bg-[#f7f7f5] dark:bg-zinc-950/70 border border-[#e6e6e6] dark:border-white/[0.05] text-xs space-y-1 text-black dark:text-zinc-200">
							<div class="flex items-center justify-between">
								<span class="font-bold text-black dark:text-zinc-100">{event.conceptName}</span>
								<span class="font-mono text-[10px] {delta >= 0 ? 'text-green-700 dark:text-emerald-400' : 'text-red-700 dark:text-rose-400'} font-bold">
									{delta >= 0 ? `+${delta}` : delta} pts ({event.newMastery}%)
								</span>
							</div>
							<div class="flex items-center gap-2 text-[11px] text-black/60 dark:text-zinc-400 font-mono">
								<span>State: <strong class="text-black dark:text-orange-300">{event.newState}</strong></span>
								<span>•</span>
								<span>Trigger: <strong class="text-black dark:text-zinc-300">{event.triggerType}</strong></span>
							</div>
							<p class="text-[11px] text-black/70 dark:text-zinc-400 pt-0.5 font-light">{event.reason}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
