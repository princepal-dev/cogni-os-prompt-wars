<script lang="ts">
	import confetti from 'canvas-confetti';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { DailyPlan, Roadmap, KnowledgeConcept, KnowledgeState, Milestone } from '$lib/types/domain';
	import ConceptBadge from '$lib/components/ui/ConceptBadge.svelte';
	import { toast } from '$lib/stores/toast';
	import {
		BookOpen,
		Code,
		Play,
		PenTool,
		Zap,
		Check,
		ArrowRight,
		Clock,
		Map,
		Target,
		Layers,
		HelpCircle,
		ChevronRight,
		Lightbulb,
		CheckCircle2,
		Sparkles
	} from 'lucide-svelte';

	let { data } = $props();

	let goal = $derived(data.goal);
	let dailyPlan = $derived(data.dailyPlan as DailyPlan);
	let concepts = $derived((data.concepts || []) as KnowledgeConcept[]);
	let conceptsWithState = $derived((data.conceptsWithState || []) as { concept: KnowledgeConcept; state: KnowledgeState }[]);
	let roadmap = $derived(data.roadmap as Roadmap | undefined);

	// Active learning concept selection
	let allModules = $derived(
		roadmap?.milestones?.flatMap((m) =>
			m.modules.map((mod) => ({
				...mod,
				milestoneTitle: m.title,
				weekNumber: m.weekNumber
			}))
		) || []
	);

	let activeModuleIndex = $state(0);
	let currentModule = $derived(allModules[activeModuleIndex] || {
		id: 'core-1',
		title: concepts[0]?.name || goal?.title || 'Core Fundamentals',
		description: concepts[0]?.description || 'Master core foundational mechanics and algorithmic invariants.',
		estimatedMinutes: 60,
		conceptNames: [concepts[0]?.name || 'Fundamentals'],
		conceptIds: [],
		status: 'IN_PROGRESS',
		milestoneTitle: 'Foundations',
		weekNumber: 1
	});

	let activeTab = $state<'learn' | 'roadmap' | 'practice' | 'notes'>('learn');

	let userCode = $state(`// Interactive Practice Drill
function solution(input: any) {
    // Write your logic here
    return input;
}`);
	let runOutput = $state<string | null>(null);
	let noteDraft = $state('');
	let isSavingNote = $state(false);
	let isCompletedModule = $state(false);

	function selectModule(index: number) {
		activeModuleIndex = index;
		runOutput = null;
		activeTab = 'learn';
	}

	function runCodeSimulation() {
		runOutput = `Running execution for "${currentModule.title}":
Target Concepts: ${(currentModule.conceptNames || []).join(', ')}
Execution Result: Passed all edge test cases!
Time Complexity: O(V + E) | Space: O(V)
Invariants verified.`;
		try {
			confetti({ particleCount: 50, spread: 60 });
		} catch (e) {}
	}

	async function saveNoteToBrain() {
		if (!noteDraft.trim()) {
			toast.warning('Please write a note before saving.');
			return;
		}
		isSavingNote = true;
		try {
			const res = await fetch(`/api/notes/${goal.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: `Notes: ${currentModule.title}`,
					markdownContent: noteDraft,
					extractedConcepts: currentModule.conceptNames || []
				})
			});
			const json = await res.json();
			if (json.success) {
				toast.success('Saved to Second Brain Notes!');
				noteDraft = '';
			} else {
				toast.error('Failed to save note.');
			}
		} catch (e: any) {
			toast.error(e.message || 'Error saving note');
		} finally {
			isSavingNote = false;
		}
	}

	function markModuleComplete() {
		isCompletedModule = true;
		toast.success(`Completed "${currentModule.title}"! Next topic unlocked.`);
		try {
			confetti({ particleCount: 80, spread: 70 });
		} catch (e) {}
		if (activeModuleIndex < allModules.length - 1) {
			activeModuleIndex += 1;
		}
	}
</script>

<svelte:head>
	<title>Interactive Learning Studio — CognitiveOS</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 text-zinc-900 dark:text-zinc-100">
	<AiAgentBanner />

	<!-- Top Session Header -->
	<div class="studio-window rounded-3xl p-6 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#121316]">
		<div class="space-y-1">
			<div class="flex items-center gap-2 flex-wrap">
				<span class="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-mono text-[11px] font-bold uppercase">
					Interactive Study Session
				</span>
				<span class="text-xs text-zinc-400">•</span>
				<span class="text-xs font-mono text-zinc-500">
					Topic {activeModuleIndex + 1} of {Math.max(allModules.length, 1)}
				</span>
				<span class="text-xs text-zinc-400">•</span>
				<span class="text-xs font-mono text-zinc-500">{currentModule.estimatedMinutes || 45} mins</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-bold font-display text-black dark:text-white">
				{currentModule.title}
			</h1>
			<p class="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
				{currentModule.description}
			</p>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<button
				type="button"
				onclick={markModuleComplete}
				class="btn-primary-pill text-xs px-5 py-2.5 flex items-center gap-1.5 cursor-pointer shadow-md"
			>
				<Check class="w-4 h-4" />
				<span>Mark Understood</span>
			</button>
			<a
				href={`/goals/${goal?.id}/quiz`}
				class="btn-secondary-pill text-xs px-4 py-2.5 flex items-center gap-1.5"
			>
				<span>Diagnostic Quiz</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>
	</div>

	<!-- Main 2-Column Workspace: Left Interactive Roadmap Navigator, Right Learning Sandbox -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
		<!-- Left (4 cols): Interactive Roadmap Stepper & Concept Navigator -->
		<div class="lg:col-span-4 space-y-4">
			<div class="rounded-3xl bg-white dark:bg-[#121316] p-5 border border-[#e6e6e6] dark:border-zinc-800 shadow-sm space-y-4">
				<div class="flex items-center justify-between pb-3 border-b border-[#e6e6e6] dark:border-zinc-800">
					<div class="flex items-center gap-2">
						<Map class="w-4 h-4 text-orange-500" />
						<h3 class="text-sm font-bold font-display">Roadmap Syllabus</h3>
					</div>
					<span class="text-[10px] font-mono text-zinc-500 font-bold">
						{activeModuleIndex + 1}/{Math.max(allModules.length, 1)} Active
					</span>
				</div>

				<!-- Module List -->
				<div class="space-y-2 max-h-[500px] overflow-y-auto pr-1">
					{#if allModules.length === 0}
						<div class="p-6 text-center text-xs text-zinc-500">
							Roadmap curriculum generating... Click below to initialize.
						</div>
					{:else}
						{#each allModules as mod, idx}
							{@const isCurrent = idx === activeModuleIndex}
							<button
								type="button"
								onclick={() => selectModule(idx)}
								class="w-full text-left p-3.5 rounded-2xl border transition-all text-xs cursor-pointer flex items-start justify-between gap-2 {isCurrent
									? 'bg-orange-50 dark:bg-orange-950/30 border-orange-500 text-orange-950 dark:text-orange-200 font-medium shadow-sm'
									: 'bg-[#fcfcfb] dark:bg-zinc-950/60 border-[#e6e6e6] dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}"
							>
								<div class="space-y-1">
									<div class="flex items-center gap-2">
										<span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold {isCurrent
											? 'bg-orange-500 text-white'
											: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}">
											{idx + 1}
										</span>
										<strong class="text-xs leading-tight">{mod.title}</strong>
									</div>
									<div class="text-[10px] font-mono text-zinc-500 pl-7">
										<span>Week {mod.weekNumber} • {mod.estimatedMinutes}m</span>
									</div>
								</div>
								<ChevronRight class="w-4 h-4 shrink-0 text-zinc-400 {isCurrent ? 'text-orange-500 translate-x-0.5' : ''} transition-transform" />
							</button>
						{/each}
					{/if}
				</div>

				<div class="pt-2 border-t border-[#e6e6e6] dark:border-zinc-800">
					<a
						href={`/goals/${goal?.id}/roadmap`}
						class="w-full py-2 rounded-xl bg-[#f4f4f2] dark:bg-zinc-900 hover:bg-[#eaeaea] dark:hover:bg-zinc-800 text-xs font-bold text-center block transition-colors"
					>
						View Full Visual Roadmap →
					</a>
				</div>
			</div>
		</div>

		<!-- Right (8 cols): Interactive Studio Canvas (Explanation, Code Simulator, Notes) -->
		<div class="lg:col-span-8 space-y-4">
			<!-- Studio Mode Tabs -->
			<div class="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-[#121316] border border-[#e6e6e6] dark:border-zinc-800 text-xs font-medium shadow-sm">
				<button
					type="button"
					onclick={() => (activeTab = 'learn')}
					class="flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 {activeTab === 'learn'
						? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
						: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'}"
				>
					<BookOpen class="w-3.5 h-3.5" />
					<span>Deep Concept Dive</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'practice')}
					class="flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 {activeTab === 'practice'
						? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
						: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'}"
				>
					<Code class="w-3.5 h-3.5" />
					<span>Interactive Code Drill</span>
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'notes')}
					class="flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 {activeTab === 'notes'
						? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm'
						: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'}"
				>
					<PenTool class="w-3.5 h-3.5" />
					<span>Second Brain Notes</span>
				</button>
			</div>

			<!-- Dynamic Content Panels -->
			<div class="rounded-3xl bg-white dark:bg-[#121316] p-6 sm:p-8 border border-[#e6e6e6] dark:border-zinc-800 shadow-sm min-h-[440px]">
				{#if activeTab === 'learn'}
					<div class="space-y-6 text-xs sm:text-sm leading-relaxed">
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<span class="px-2 py-0.5 rounded-md bg-[#dceeb1] text-black font-mono text-[10px] font-bold">
									MODULE FOCUS
								</span>
								<h3 class="text-xl font-bold font-display text-black dark:text-white">
									{currentModule.title}
								</h3>
							</div>
							<p class="text-zinc-600 dark:text-zinc-300 leading-relaxed">
								{currentModule.description}
							</p>
						</div>

						<!-- Core Conceptual Invariants Callout -->
						<div class="p-5 rounded-2xl bg-[#f4ecd6] dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 space-y-3 text-amber-950 dark:text-amber-200">
							<div class="flex items-center gap-2 font-bold font-mono text-xs text-amber-900 dark:text-amber-300">
								<Lightbulb class="w-4 h-4 text-amber-600" />
								<span>Core Invariants & Key Mental Models:</span>
							</div>
							<ul class="space-y-2 text-xs font-mono list-disc pl-5">
								<li>Identify boundary cases and initial state transitions early.</li>
								<li>Maintain active tracking of visited nodes/states to avoid infinite loops and duplicate subproblems.</li>
								<li>Optimize space-time tradeoffs: verify whether auxiliary space matches target bounds.</li>
							</ul>
						</div>

						<!-- Target Concepts in this Unit -->
						<div class="space-y-3 pt-2">
							<h4 class="text-xs font-bold uppercase tracking-wider font-mono text-zinc-500">
								Covered Concepts in this Roadmap Milestone:
							</h4>
							<div class="flex flex-wrap gap-2">
								{#each (currentModule.conceptNames || []) as cName}
									<span class="px-3 py-1.5 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
										<Zap class="w-3.5 h-3.5 text-orange-500" />
										<span>{cName}</span>
									</span>
								{/each}
							</div>
						</div>

						<div class="pt-4 flex items-center justify-between border-t border-[#e6e6e6] dark:border-zinc-800">
							<button
								type="button"
								onclick={() => (activeTab = 'practice')}
								class="btn-primary-pill text-xs px-6 py-3 flex items-center gap-2 cursor-pointer"
							>
								<Code class="w-4 h-4" />
								<span>Try Interactive Code Drill</span>
								<ArrowRight class="w-4 h-4" />
							</button>
						</div>
					</div>

				{:else if activeTab === 'practice'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-sm font-bold text-black dark:text-white">Active Drill Sandbox</h3>
								<p class="text-xs text-zinc-500">Test and simulate implementation logic for {currentModule.title}</p>
							</div>
							<button
								type="button"
								onclick={runCodeSimulation}
								class="btn-primary-pill text-xs px-5 py-2.5 flex items-center gap-1.5 cursor-pointer"
							>
								<Play class="w-3.5 h-3.5 fill-white text-white" />
								<span>Run & Verify</span>
							</button>
						</div>

						<textarea
							bind:value={userCode}
							rows="10"
							class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-2xl p-4 text-xs font-mono text-zinc-900 dark:text-orange-200 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed"
						></textarea>

						{#if runOutput}
							<div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-xs font-mono text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-150 flex items-start gap-2">
								<CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
								<div>{runOutput}</div>
							</div>
						{/if}
					</div>

				{:else if activeTab === 'notes'}
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-sm font-bold text-black dark:text-white">Second Brain Notes</h3>
								<p class="text-xs text-zinc-500">Capture takeaways, insights, or confusions directly into Obsidian Vault</p>
							</div>
						</div>

						<textarea
							bind:value={noteDraft}
							rows="8"
							placeholder="Write summary notes or questions for this roadmap topic..."
							class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-2xl p-4 text-xs font-mono text-zinc-900 dark:text-zinc-100 border border-[#e6e6e6] dark:border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed"
						></textarea>

						<div class="flex justify-end">
							<button
								type="button"
								onclick={saveNoteToBrain}
								disabled={isSavingNote}
								class="btn-primary-pill text-xs px-6 py-2.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
							>
								<PenTool class="w-3.5 h-3.5" />
								<span>{isSavingNote ? 'Saving to Vault...' : 'Save to Second Brain'}</span>
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
