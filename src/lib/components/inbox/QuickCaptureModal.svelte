<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { InboxItem } from '$lib/types/domain';
	import { Link, Video, FileText, HelpCircle, Zap, Brain } from 'lucide-svelte';

	let {
		isOpen = false,
		onClose,
		goalId,
		onItemCaptured
	}: {
		isOpen: boolean;
		onClose: () => void;
		goalId?: string;
		onItemCaptured?: (item: InboxItem) => void;
	} = $props();

	let type = $state<'URL' | 'YOUTUBE' | 'ARTICLE' | 'SNIPPET' | 'QUESTION' | 'NOTE'>('URL');
	let title = $state('');
	let content = $state('');
	let url = $state('');
	let isSubmitting = $state(false);

	const captureTypes = [
		{ id: 'URL', label: 'Web Link', icon: Link },
		{ id: 'YOUTUBE', label: 'YouTube Video', icon: Video },
		{ id: 'ARTICLE', label: 'Article / Doc', icon: FileText },
		{ id: 'QUESTION', label: 'Question', icon: HelpCircle },
		{ id: 'SNIPPET', label: 'Code / Text', icon: Zap }
	];

	async function handleCapture() {
		if (!title.trim() && !url.trim()) return;
		isSubmitting = true;
		try {
			const res = await fetch('/api/inbox', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type,
					title: title.trim() || url.trim(),
					content: content.trim(),
					url: url.trim() || undefined,
					goalId
				})
			});
			const json = await res.json();
			if (json.success) {
				if (onItemCaptured) onItemCaptured(json.data);
				title = '';
				content = '';
				url = '';
				onClose();
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Modal {isOpen} {onClose} title="Universal Learning Capture">
	<div class="space-y-4">
		<!-- Type Selector -->
		<div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 flex-wrap">
			{#each captureTypes as ct}
				{@const TypeIcon = ct.icon}
				<button
					type="button"
					onclick={() => (type = ct.id as any)}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer {type === ct.id
						? 'bg-orange-600 text-white font-semibold shadow-sm'
						: 'text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
				>
					<TypeIcon class="w-3.5 h-3.5" />
					<span>{ct.label}</span>
				</button>
			{/each}
		</div>

		<!-- Title -->
		<div>
			<label for="capture-title" class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
				Title / Quick Summary:
			</label>
			<input
				id="capture-title"
				type="text"
				bind:value={title}
				placeholder="e.g. Graph Algorithms playlist or 'Why does Dijkstra fail with negative edges?'"
				class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-medium"
			/>
		</div>

		<!-- URL (Optional for URLs/YouTube) -->
		{#if type === 'URL' || type === 'YOUTUBE' || type === 'ARTICLE'}
			<div>
				<label for="capture-url" class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
					Resource URL:
				</label>
				<input
					id="capture-url"
					type="url"
					bind:value={url}
					placeholder="https://youtube.com/watch?v=... or https://leetcode.com/..."
					class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 font-mono"
				/>
			</div>
		{/if}

		<!-- Content / Notes -->
		<div>
			<label for="capture-content" class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
				Notes / Snippet Context (Optional):
			</label>
			<textarea
				id="capture-content"
				bind:value={content}
				rows="3"
				placeholder="Paste snippet or thoughts here..."
				class="w-full bg-[#fcfcfb] dark:bg-zinc-950 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 border border-[#e0e0dc] dark:border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed resize-y font-mono"
			></textarea>
		</div>

		<!-- AI Triage Notice -->
		<div class="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-500/20 text-[11px] text-orange-900 dark:text-orange-300 flex items-center gap-2">
			<Brain class="w-4 h-4 text-orange-500 shrink-0" />
			<span>AI will automatically organize this into your active learning roadmap.</span>
		</div>

		<!-- Submit Button -->
		<div class="flex items-center justify-end gap-2 pt-2">
			<button
				type="button"
				onclick={onClose}
				class="px-4 py-2 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleCapture}
				disabled={(!title.trim() && !url.trim()) || isSubmitting}
				class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all cursor-pointer"
			>
				{isSubmitting ? 'Capturing...' : 'Capture to Inbox'}
			</button>
		</div>
	</div>
</Modal>
