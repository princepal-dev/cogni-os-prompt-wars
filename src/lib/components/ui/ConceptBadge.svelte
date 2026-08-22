<script lang="ts">
	import type { ConceptStateType } from '$lib/types/domain';
	import {
		Circle,
		CircleDot,
		Loader2,
		TrendingUp,
		Zap,
		ShieldCheck,
		Award,
		AlertTriangle
	} from 'lucide-svelte';

	let { state, score, size = 'md' }: { state: ConceptStateType; score?: number; size?: 'sm' | 'md' | 'lg' } = $props();

	const stateConfig: Record<ConceptStateType, { label: string; icon: typeof Circle; bg: string; text: string; border: string }> = {
		UNKNOWN: {
			label: 'Unknown',
			icon: Circle,
			bg: 'bg-zinc-800/60',
			text: 'text-zinc-400',
			border: 'border-zinc-700/50'
		},
		INTRODUCED: {
			label: 'Introduced',
			icon: CircleDot,
			bg: 'bg-sky-950/40',
			text: 'text-sky-400',
			border: 'border-sky-800/40'
		},
		LEARNING: {
			label: 'Learning',
			icon: Loader2,
			bg: 'bg-blue-950/50',
			text: 'text-blue-400',
			border: 'border-blue-700/50'
		},
		DEVELOPING: {
			label: 'Developing',
			icon: TrendingUp,
			bg: 'bg-amber-950/40',
			text: 'text-amber-300',
			border: 'border-amber-700/40'
		},
		PRACTICING: {
			label: 'Practicing',
			icon: Zap,
			bg: 'bg-purple-950/40',
			text: 'text-purple-300',
			border: 'border-purple-700/40'
		},
		STRONG: {
			label: 'Strong',
			icon: ShieldCheck,
			bg: 'bg-emerald-950/50',
			text: 'text-emerald-300',
			border: 'border-emerald-700/50'
		},
		MASTERED: {
			label: 'Mastered',
			icon: Award,
			bg: 'bg-emerald-900/60',
			text: 'text-emerald-200',
			border: 'border-emerald-500/60'
		},
		NEEDS_REVIEW: {
			label: 'Needs Review',
			icon: AlertTriangle,
			bg: 'bg-rose-950/50',
			text: 'text-rose-300',
			border: 'border-rose-700/50'
		}
	};

	let cfg = $derived(stateConfig[state] || stateConfig.UNKNOWN);
	let Icon = $derived(cfg.icon);
	let sizeClasses = $derived(
		size === 'sm'
			? 'px-1.5 py-0.5 text-xs'
			: size === 'lg'
				? 'px-3 py-1 text-sm font-medium'
				: 'px-2 py-0.5 text-xs font-medium'
	);
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-md border font-mono tracking-tight transition-colors {cfg.bg} {cfg.text} {cfg.border} {sizeClasses}"
	role="status"
	aria-label="Knowledge state: {cfg.label}"
>
	<Icon class="w-3 h-3 shrink-0" aria-hidden="true" />
	<span>{cfg.label}</span>
	{#if score !== undefined && score > 0}
		<span class="opacity-60 text-[0.85em] ml-0.5">({score}%)</span>
	{/if}
</span>
