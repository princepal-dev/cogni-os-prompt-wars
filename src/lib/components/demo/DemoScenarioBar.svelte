<script lang="ts">
	import confetti from 'canvas-confetti';
	import type { LearningGoal } from '$lib/types/domain';
	import { Sparkles, Zap } from 'lucide-svelte';

	let { activeGoal, onAdapted } = $props<{
		activeGoal: LearningGoal | null;
		onAdapted?: () => void;
	}>();

	let isTriggering = $state(false);
	let adaptationSuccess = $state<string | null>(null);

	async function runMagicMoment() {
		if (!activeGoal) return;
		isTriggering = true;
		adaptationSuccess = null;
		try {
			const res = await fetch('/api/demo/magic-moment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ goalId: activeGoal.id })
			});
			const json = await res.json();
			if (json.success) {
				adaptationSuccess = 'Dynamic Adaptation Verified: DFS gap detected → Recursion Refresher injected into Week 1 → Dijkstra rescheduled!';
				try {
					confetti({ particleCount: 80, spread: 70, origin: { y: 0.2 } });
				} catch (e) {}
				if (onAdapted) onAdapted();
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			}
		} catch (e) {
			console.error(e);
		} finally {
			isTriggering = false;
		}
	}
</script>

<!-- Sleek Hackathon Evaluator Bar -->
<div class="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/20 via-zinc-900/60 to-zinc-950/80 p-3 sm:p-3.5 backdrop-blur-md shadow-lg transition-all">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div class="flex items-center gap-2.5">
			<span class="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-sm shrink-0">
				<Zap class="w-4 h-4 text-orange-400" />
			</span>
			<div>
				<div class="flex items-center gap-2">
					<span class="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400">Evaluator Demo</span>
					<span class="text-zinc-600 text-xs">•</span>
					<span class="text-xs font-semibold text-zinc-200">The "Magic Moment" Adaptive Simulation</span>
				</div>
				<p class="text-[11px] text-zinc-400 mt-0.5 hidden md:block">
					Simulate struggling on DFS recursion to watch the engine inject a prerequisite refresher and reschedule downstream milestones.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2 shrink-0">
			<button
				type="button"
				onclick={runMagicMoment}
				disabled={isTriggering}
				class="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
			>
				<Sparkles class="w-3.5 h-3.5" />
				<span>{isTriggering ? 'Simulating Adaptation...' : 'Trigger Dynamic Adaptation'}</span>
			</button>
		</div>
	</div>

	{#if adaptationSuccess}
		<div class="mt-2.5 p-2.5 rounded-xl bg-orange-950/60 border border-orange-500/40 text-xs font-mono text-orange-200 text-center animate-in fade-in duration-150 flex items-center justify-center gap-2">
			<Sparkles class="w-3.5 h-3.5 text-orange-300" />
			<span>{adaptationSuccess}</span>
		</div>
	{/if}
</div>
