<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	let {
		isOpen = false,
		title = '',
		onClose,
		children,
		maxWidth = 'max-w-2xl'
	}: {
		isOpen: boolean;
		title?: string;
		onClose: () => void;
		children?: Snippet;
		maxWidth?: string;
	} = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Backdrop click to dismiss -->
		<button
			type="button"
			class="fixed inset-0 w-full h-full cursor-default bg-transparent border-0"
			onclick={onClose}
			tabindex="-1"
			aria-label="Close dialog overlay"
		></button>

		<!-- Dialog Panel -->
		<div
			class="relative w-full {maxWidth} max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#121316] border border-[#e6e6e6] dark:border-white/[0.08] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-black dark:text-zinc-100"
		>
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-[#e6e6e6] dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-950/60">
					<h2 id="modal-title" class="text-base font-bold text-zinc-900 dark:text-zinc-100 font-display">{title}</h2>
					<button
						type="button"
						onclick={onClose}
						class="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white p-1.5 rounded-lg hover:bg-[#f0f0ee] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
						aria-label="Close modal"
					>
						<X class="w-4 h-4" />
					</button>
				</div>
			{/if}

			<div class="p-6 overflow-y-auto">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}
