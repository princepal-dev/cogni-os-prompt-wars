<script lang="ts">
	import type { Task } from '$lib/types/domain';
	import { Inbox, BookOpen, Zap, History, Award, Clock } from 'lucide-svelte';

	let {
		tasks,
		goalId,
		onTaskStatusChanged
	}: {
		tasks: Task[];
		goalId: string;
		onTaskStatusChanged?: (taskId: string, newStatus: any) => void;
	} = $props();

	const columns = [
		{ id: 'BACKLOG', label: 'Backlog', icon: Inbox, color: 'border-[#e0e0dc] dark:border-zinc-800' },
		{ id: 'TODO', label: 'To Learn', icon: BookOpen, color: 'border-blue-300 dark:border-blue-900/50' },
		{ id: 'IN_PROGRESS', label: 'Practicing', icon: Zap, color: 'border-amber-300 dark:border-amber-900/50' },
		{ id: 'REVIEW', label: 'Review', icon: History, color: 'border-purple-300 dark:border-purple-900/50' },
		{ id: 'COMPLETED', label: 'Mastered', icon: Award, color: 'border-emerald-300 dark:border-emerald-900/50' }
	];

	async function moveTask(taskId: string, newStatus: string) {
		if (onTaskStatusChanged) {
			onTaskStatusChanged(taskId, newStatus);
		} else {
			try {
				await fetch(`/api/tasks/${goalId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ taskId, status: newStatus })
				});
				const t = tasks.find((item) => item.id === taskId);
				if (t) t.status = newStatus as any;
			} catch (e) {
				console.error(e);
			}
		}
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
	{#each columns as col}
		{@const colTasks = tasks.filter((t) => t.status === col.id)}
		{@const ColumnIcon = col.icon}
		<div class="flex flex-col rounded-2xl bg-white dark:bg-[#121316] border {col.color} p-4 min-h-[450px] shadow-sm">
			<!-- Column Header -->
			<div class="flex items-center justify-between pb-3 mb-3 border-b border-[#e6e6e6] dark:border-zinc-800">
				<div class="flex items-center gap-2 font-display font-bold text-xs text-zinc-900 dark:text-zinc-200">
					<ColumnIcon class="w-4 h-4 text-orange-500" />
					<span>{col.label}</span>
				</div>
				<span class="w-5 h-5 rounded-full bg-[#f0f0ee] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 font-mono text-[10px] flex items-center justify-center font-bold">
					{colTasks.length}
				</span>
			</div>

			<!-- Tasks Container -->
			<div class="space-y-3 flex-1 overflow-y-auto">
				{#each colTasks as task}
					<div class="rounded-xl bg-[#fcfcfb] dark:bg-zinc-950/80 p-3.5 border border-[#e0e0dc] dark:border-zinc-800/90 text-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col justify-between gap-2 shadow-sm">
						<div>
							{#if task.conceptName}
								<span class="text-[10px] font-mono text-orange-600 dark:text-orange-400 font-semibold block mb-1">
									{task.conceptName}
								</span>
							{/if}
							<h4 class="font-bold text-zinc-900 dark:text-zinc-100 leading-snug">{task.title}</h4>
							<p class="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">{task.description}</p>
						</div>

						<div class="pt-2 border-t border-[#e6e6e6] dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
							<span class="font-mono text-zinc-600 dark:text-zinc-400 bg-[#f0f0ee] dark:bg-zinc-900 px-2 py-0.5 rounded border border-[#e0e0dc] dark:border-zinc-800 flex items-center gap-1">
								<Clock class="w-3 h-3" />
								<span>{task.estimatedMinutes}m</span>
							</span>

							<!-- Quick Status Mover -->
							<select
								value={task.status}
								onchange={(e) => moveTask(task.id, (e.target as HTMLSelectElement).value)}
								class="bg-white dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-orange-500 cursor-pointer"
								aria-label="Move task column"
							>
								{#each columns as targetCol}
									<option value={targetCol.id}>{targetCol.label}</option>
								{/each}
							</select>
						</div>
					</div>
				{/each}

				{#if colTasks.length === 0}
					<div class="h-32 flex items-center justify-center border border-dashed border-[#e0e0dc] dark:border-zinc-800/80 rounded-xl text-[11px] text-zinc-400 dark:text-zinc-600 font-mono">
						No items
					</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
