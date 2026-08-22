<script lang="ts">
	import QuickCaptureModal from '$lib/components/inbox/QuickCaptureModal.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { InboxItem } from '$lib/types/domain';
	import { Link, Video, FileText, HelpCircle, Zap, BookOpen, Plus, Target, ExternalLink } from 'lucide-svelte';

	let { data } = $props();

	let items = $state<InboxItem[]>([]);
	let isModalOpen = $state(false);

	$effect(() => {
		items = (data.items || []) as InboxItem[];
	});

	const typeIcon: Record<string, typeof Link> = {
		URL: Link,
		YOUTUBE: Video,
		ARTICLE: FileText,
		QUESTION: HelpCircle,
		SNIPPET: Zap,
		NOTE: BookOpen
	};

	function onItemCaptured(newItem: InboxItem) {
		items = [newItem, ...items];
	}

	async function updateStatus(id: string, status: 'INBOX' | 'PROCESSED' | 'ARCHIVED') {
		const target = items.find((i) => i.id === id);
		if (target) target.triageStatus = status;
	}
</script>

<svelte:head>
	<title>Universal Learning Inbox — CognitiveOS</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<AiAgentBanner />

	<!-- Header -->
	<div class="studio-window rounded-2xl p-5 border border-[#e6e6e6] dark:border-zinc-800 shadow-xl flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-500">Universal Capture</span>
				<span class="text-xs text-zinc-400 dark:text-zinc-500">•</span>
				<span class="text-xs text-zinc-600 dark:text-zinc-400 font-mono">{items.length} Items Captured</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-display">Learning Inbox</h1>
		</div>

		<button
			type="button"
			onclick={() => (isModalOpen = true)}
			class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>Capture New Item</span>
		</button>
	</div>

	<!-- Inbox List in Studio Cards -->
	<div class="space-y-3">
		{#each items as item}
			{@const ItemIcon = typeIcon[item.type] || Link}
			<div class="studio-window rounded-2xl p-5 border border-[#e6e6e6] dark:border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-start gap-3.5">
					<span class="w-9 h-9 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5 text-zinc-700 dark:text-zinc-300">
						<ItemIcon class="w-4 h-4 text-orange-500" />
					</span>
					<div>
						<div class="flex items-center gap-2 flex-wrap mb-1">
							<h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
							{#if item.aiSuggestedGoalTitle}
								<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-500/30 text-orange-800 dark:text-orange-300 flex items-center gap-1">
									<Target class="w-3 h-3 text-orange-500" />
									<span>Organized for: {item.aiSuggestedGoalTitle}</span>
								</span>
							{/if}
						</div>
						{#if item.content}
							<p class="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{item.content}</p>
						{/if}
						{#if item.url}
							<a
								href={item.url}
								target="_blank"
								rel="noreferrer"
								class="text-[11px] font-mono text-orange-600 dark:text-orange-400 hover:underline mt-1 inline-flex items-center gap-1 truncate max-w-md"
							>
								<span>{item.url}</span>
								<ExternalLink class="w-3 h-3" />
							</a>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
					<button
						type="button"
						onclick={() => updateStatus(item.id, 'PROCESSED')}
						class="px-3.5 py-1.5 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-[#e0e0dc] dark:border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
					>
						Process to Roadmap
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<QuickCaptureModal
	isOpen={isModalOpen}
	onClose={() => (isModalOpen = false)}
	onItemCaptured={onItemCaptured}
/>
