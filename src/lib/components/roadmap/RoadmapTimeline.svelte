<script lang="ts">
	import type { Roadmap, Milestone, RoadmapModule } from '$lib/types/domain';
	import { Video, FileText, Code, Zap, HelpCircle, History, Sparkles, Clock, Lightbulb } from 'lucide-svelte';

	let { roadmap } = $props<{ roadmap: Roadmap }>();

	const formatIcon: Record<string, typeof Zap> = {
		VIDEO: Video,
		READING: FileText,
		CODING: Code,
		PRACTICE: Zap,
		QUIZ: HelpCircle,
		REVIEW: History
	};
</script>

<div class="space-y-6">
	<!-- Roadmap Header & Adaptation Notification Banner -->
	{#if roadmap.activeAdaptationNotice}
		<div class="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-500/50 flex items-start gap-3 text-xs shadow-lg animate-in fade-in duration-200">
			<Sparkles class="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
			<div>
				<div class="flex items-center gap-2">
					<strong class="text-orange-900 dark:text-orange-300 font-bold">Continuous Adaptation Engine Active:</strong>
					<span class="px-2 py-0.2 rounded bg-orange-200 dark:bg-orange-900/60 border border-orange-400 dark:border-orange-500/40 text-orange-950 dark:text-orange-200 font-mono text-[10px]">
						v{roadmap.version} • {roadmap.adaptationCount} Re-plans
					</span>
				</div>
				<p class="text-orange-800 dark:text-zinc-300 mt-1 leading-relaxed">{roadmap.activeAdaptationNotice}</p>
			</div>
		</div>
	{/if}

	<!-- Milestones Timeline List -->
	<div class="space-y-6">
		{#each roadmap.milestones as milestone, mIdx}
			<div class="studio-window rounded-2xl p-6 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl space-y-4">
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e6e6e6] dark:border-zinc-800/80">
					<div class="flex items-center gap-3">
						<span class="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 font-mono font-bold flex items-center justify-center text-xs">
							W{milestone.weekNumber}
						</span>
						<div>
							<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-display">{milestone.title}</h3>
							<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{milestone.description}</p>
						</div>
					</div>

					<span class="px-3 py-1 rounded-full border text-[11px] font-mono font-bold self-start sm:self-auto {milestone.status === 'ACTIVE'
						? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
						: milestone.status === 'COMPLETED'
							? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
							: 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-850'}">
						{milestone.status}
					</span>
				</div>

				<!-- Modules List in Milestone -->
				<div class="space-y-2.5">
					{#each milestone.modules as mod}
						{@const Icon = formatIcon[mod.formatType] || Zap}
						<div
							class="p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 {mod.isPrerequisiteInjection
								? 'bg-orange-50/80 dark:bg-gradient-to-r dark:from-orange-950/50 dark:to-zinc-950/90 border-orange-400 dark:border-orange-500/60 shadow-md'
								: 'bg-[#fcfcfb] dark:bg-zinc-950/80 border-[#e6e6e6] dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700'}"
						>
							<div class="flex items-start gap-3">
								<span class="w-8 h-8 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300">
									<Icon class="w-4 h-4" />
								</span>
								<div class="space-y-1">
									<div class="flex items-center gap-2 flex-wrap">
										<h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{mod.title}</h4>
										{#if mod.isPrerequisiteInjection}
											<span class="px-2 py-0.5 rounded-full bg-orange-600 text-white font-mono text-[9px] font-bold shadow-sm animate-pulse flex items-center gap-1">
												<Sparkles class="w-2.5 h-2.5" />
												<span>Injected Prerequisite</span>
											</span>
										{/if}
									</div>
									<p class="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">{mod.description}</p>
									{#if mod.whyReason}
										<div class="text-[10px] font-mono text-orange-600 dark:text-orange-400/90 mt-1 flex items-center gap-1">
											<Lightbulb class="w-3 h-3 text-amber-500" />
											<span>{mod.whyReason}</span>
										</div>
									{/if}
								</div>
							</div>

							<div class="flex items-center gap-3 shrink-0 self-end sm:self-auto">
								<span class="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
									<Clock class="w-3 h-3" />
									<span>{mod.estimatedMinutes}m</span>
								</span>
								<span class="px-2.5 py-1 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-[10px] font-mono text-zinc-700 dark:text-zinc-300">
									{mod.status}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
