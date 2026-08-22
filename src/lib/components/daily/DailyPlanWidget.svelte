<script lang="ts">
	import confetti from 'canvas-confetti';
	import type { DailyPlan, DailyPlanItem } from '$lib/types/domain';
	import { History, BookOpen, Zap, Layers, HelpCircle, Lightbulb, Check, Clock, ArrowRight } from 'lucide-svelte';

	let { dailyPlan, goalId } = $props<{ dailyPlan: DailyPlan; goalId: string }>();

	let items = $state<DailyPlanItem[]>([]);
	let selectedWhyItem = $state<DailyPlanItem | null>(null);

	$effect(() => {
		items = dailyPlan.items;
	});

	const completedCount = $derived(items.filter((i) => i.status === 'COMPLETED').length);
	const progressPercent = $derived(
		items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0
	);

	const typeBadge: Record<string, { label: string; color: string; icon: typeof Zap }> = {
		REVIEW: { label: 'Spaced Review', color: 'bg-amber-950/60 text-amber-300 border-amber-600/40', icon: History },
		LEARN: { label: 'New Concept', color: 'bg-orange-950/60 text-orange-300 border-orange-600/40', icon: BookOpen },
		PRACTICE: { label: 'Active Coding Drill', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40', icon: Zap },
		FLASHCARDS: { label: 'Flashcard Recall', color: 'bg-amber-950/60 text-amber-300 border-amber-600/40', icon: Layers },
		QUIZ: { label: 'Diagnostic Quiz', color: 'bg-rose-950/60 text-rose-300 border-rose-600/40', icon: HelpCircle }
	};

	async function toggleStatus(item: DailyPlanItem) {
		const newStatus = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
		item.status = newStatus;

		if (newStatus === 'COMPLETED') {
			try {
				confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
			} catch (e) {}
		}

		await fetch(`/api/daily-plan/${goalId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ itemId: item.id, status: newStatus })
		});
	}
</script>

<div class="studio-window rounded-2xl p-6 border border-zinc-800 shadow-xl space-y-5">
	<!-- Widget Header with macOS Traffic Lights -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Daily Itinerary</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs font-mono text-zinc-400">{dailyPlan.availableMinutes} min budget</span>
			</div>
			<h2 class="text-lg font-bold text-zinc-100 font-display">What should I do right now?</h2>
		</div>

		<!-- Progress pill -->
		<div class="flex items-center gap-3">
			<div class="text-right">
				<span class="text-xs font-mono text-zinc-400">{completedCount} of {items.length} items</span>
				<span class="block text-xs font-bold text-orange-400">{progressPercent}% done</span>
			</div>
			<div class="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-orange-400">
				{progressPercent}%
			</div>
		</div>
	</div>

	<!-- Itinerary Summary Box -->
	<div class="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs flex items-center justify-between">
		<p class="text-zinc-300">{dailyPlan.summary}</p>
		<a
			href={`/goals/${goalId}/learn`}
			class="shrink-0 ml-3 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1"
		>
			<span>Start Focused Session</span>
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	<!-- Today's Action Items List -->
	<div class="space-y-2.5">
		{#each items as item}
			{@const badge = typeBadge[item.type] || typeBadge.LEARN}
			{@const BadgeIcon = badge.icon}
			{@const isDone = item.status === 'COMPLETED'}
			<div
				class="group p-4 rounded-xl border transition-all flex items-start justify-between gap-4 {isDone
					? 'bg-zinc-950/40 border-zinc-850 opacity-60'
					: 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'}"
			>
				<div class="flex items-start gap-3">
					<button
						type="button"
						onclick={() => toggleStatus(item)}
						class="w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors cursor-pointer {isDone
							? 'bg-emerald-500 border-emerald-400 text-zinc-950'
							: 'border-zinc-700 hover:border-orange-500 bg-zinc-900'}"
					>
						{#if isDone}
							<Check class="w-3 h-3 text-zinc-950 stroke-[3]" />
						{/if}
					</button>

					<div class="space-y-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="text-xs font-bold text-zinc-200 {isDone ? 'line-through text-zinc-500' : ''}">
								{item.title}
							</span>
							<span class="text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 {badge.color}">
								<BadgeIcon class="w-3 h-3" />
								<span>{badge.label}</span>
							</span>
						</div>
						<div class="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
							<span class="flex items-center gap-1">
								<Clock class="w-3 h-3 text-zinc-500" />
								<span>{item.estimatedMinutes} min</span>
							</span>
							{#if item.conceptName}
								<span>• Concept: {item.conceptName}</span>
							{/if}
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2 shrink-0">
					<button
						type="button"
						onclick={() => (selectedWhyItem = selectedWhyItem?.id === item.id ? null : item)}
						class="text-[11px] font-mono text-zinc-500 hover:text-orange-400 transition-colors p-1 flex items-center gap-1 cursor-pointer"
						title="Why was this scheduled today?"
					>
						<Lightbulb class="w-3 h-3" />
						<span>Why?</span>
					</button>
				</div>
			</div>

			<!-- Collapsible "Why?" Explanation Drawer -->
			{#if selectedWhyItem?.id === item.id}
				<div class="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs space-y-1 animate-in fade-in duration-150">
					<div class="flex items-center gap-1.5 text-orange-300 font-semibold">
						<Lightbulb class="w-3.5 h-3.5" />
						<span>AI Scheduling Rationale:</span>
					</div>
					<p class="text-zinc-300 text-[11px] leading-relaxed">
						{item.whyReason}
					</p>
				</div>
			{/if}
		{/each}
	</div>
</div>
