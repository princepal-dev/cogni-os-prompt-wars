<script lang="ts">
	import KanbanBoard from '$lib/components/kanban/KanbanBoard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { Task } from '$lib/types/domain';

	let { data } = $props();

	let tasks = $state<Task[]>([]);
	let isNewTaskOpen = $state(false);

	$effect(() => {
		tasks = (data.tasks || []) as Task[];
	});

	let title = $state('');
	let description = $state('');
	let conceptName = $state('Breadth-First Search (BFS)');
	let estimatedMinutes = $state(25);
	let whyReason = $state('Generated to target active knowledge gap.');
	let isSubmitting = $state(false);

	async function handleCreateTask() {
		if (!title.trim()) return;
		isSubmitting = true;
		try {
			const res = await fetch(`/api/tasks/${data.goal?.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description,
					conceptName,
					estimatedMinutes,
					whyReason
				})
			});
			const json = await res.json();
			if (json.success) {
				tasks = [...tasks, json.data];
				title = '';
				description = '';
				isNewTaskOpen = false;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Task Kanban — CognitiveOS</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<AiAgentBanner />

	<div class="studio-window rounded-2xl p-5 border border-zinc-800 shadow-xl flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Learning Workflow</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs text-zinc-400 font-mono">{tasks.length} Active Items</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-100 font-display">Learning-Aware Kanban</h1>
		</div>

		<button
			type="button"
			onclick={() => (isNewTaskOpen = true)}
			class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
		>
			<span>+</span>
			<span>Add Learning Task</span>
		</button>
	</div>

	<KanbanBoard {tasks} goalId={data.goal?.id || ''} />
</div>

<Modal isOpen={isNewTaskOpen} onClose={() => (isNewTaskOpen = false)} title="New Learning-Aware Task">
	<div class="space-y-4">
		<div>
			<label for="task-title" class="block text-xs font-semibold text-zinc-300 mb-1">Task Title:</label>
			<input
				id="task-title"
				type="text"
				bind:value={title}
				placeholder="e.g. Solve 2 BFS shortest path problems on LeetCode"
				class="w-full bg-zinc-950 rounded-xl px-3.5 py-2 text-xs text-zinc-100 border border-zinc-800 focus:outline-none focus:border-orange-500"
			/>
		</div>

		<div>
			<label for="task-concept" class="block text-xs font-semibold text-zinc-300 mb-1">Target Concept:</label>
			<input
				id="task-concept"
				type="text"
				bind:value={conceptName}
				class="w-full bg-zinc-950 rounded-xl px-3.5 py-2 text-xs text-zinc-100 border border-zinc-800 focus:outline-none focus:border-orange-500 font-mono"
			/>
		</div>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="task-minutes" class="block text-xs font-semibold text-zinc-300 mb-1">Estimated Minutes:</label>
				<input
					id="task-minutes"
					type="number"
					bind:value={estimatedMinutes}
					min="5"
					max="120"
					class="w-full bg-zinc-950 rounded-xl px-3.5 py-2 text-xs text-zinc-100 border border-zinc-800 font-mono"
				/>
			</div>
		</div>

		<div>
			<label for="task-desc" class="block text-xs font-semibold text-zinc-300 mb-1">Guidance / Description:</label>
			<textarea
				id="task-desc"
				bind:value={description}
				rows="3"
				placeholder="Specific problem links, focus invariants, or guidance..."
				class="w-full bg-zinc-950 rounded-xl p-3 text-xs text-zinc-100 border border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed"
			></textarea>
		</div>

		<div class="flex items-center justify-end gap-2 pt-2">
			<button
				type="button"
				onclick={() => (isNewTaskOpen = false)}
				class="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
			>
				Cancel
			</button>
			<button
				type="button"
				onclick={handleCreateTask}
				disabled={!title.trim() || isSubmitting}
				class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md disabled:opacity-50 transition-all cursor-pointer"
			>
				{isSubmitting ? 'Creating...' : 'Create Task'}
			</button>
		</div>
	</div>
</Modal>
