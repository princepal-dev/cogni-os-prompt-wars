<script lang="ts">
	import { toast } from '$lib/stores/toast';
	import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4 sm:p-0">
	{#each $toast as t (t.id)}
		<div
			in:fly={{ y: 20, duration: 250 }}
			out:fade={{ duration: 150 }}
			class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm backdrop-blur-md transition-all
			{t.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-100 shadow-emerald-950/30' : ''}
			{t.type === 'error' ? 'bg-rose-950/90 border-rose-800 text-rose-100 shadow-rose-950/30' : ''}
			{t.type === 'warning' ? 'bg-amber-950/90 border-amber-800 text-amber-100 shadow-amber-950/30' : ''}
			{t.type === 'info' ? 'bg-zinc-900/90 border-zinc-700 text-zinc-100 shadow-zinc-950/30' : ''}"
		>
			<div class="flex items-center gap-2.5">
				{#if t.type === 'success'}
					<CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
				{:else if t.type === 'error'}
					<AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />
				{:else if t.type === 'warning'}
					<AlertTriangle class="w-4 h-4 text-amber-400 shrink-0" />
				{:else}
					<Info class="w-4 h-4 text-zinc-400 shrink-0" />
				{/if}
				<span class="font-medium text-xs sm:text-sm">{t.message}</span>
			</div>
			<button
				onclick={() => toast.dismiss(t.id)}
				class="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
				aria-label="Dismiss toast"
			>
				<X class="w-3.5 h-3.5" />
			</button>
		</div>
	{/each}
</div>
