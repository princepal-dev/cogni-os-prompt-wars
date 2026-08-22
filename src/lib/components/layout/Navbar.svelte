<script lang="ts">
	import { page } from '$app/state';
	import type { User, LearningGoal } from '$lib/types/domain';
	import { createAiStatusQuery } from '$lib/query/queries';
	import { uiStore } from '$lib/stores/ui.store';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import UserDropdown from '$lib/components/layout/UserDropdown.svelte';
	import { PanelLeft, Zap, Bot, Target } from 'lucide-svelte';

	let { user, activeGoal, goals = [] } = $props<{
		user: User | null;
		activeGoal: LearningGoal | null;
		goals?: LearningGoal[];
	}>();

	let aiQuery = createAiStatusQuery();
	let isSidebarExpanded = $derived($uiStore.sidebarExpanded);

	function toggleSidebar() {
		uiStore.toggleSidebar();
	}
</script>

<header class="h-14 studio-window-header border-b border-[#e6e6e6] dark:border-zinc-800/80 px-4 flex items-center justify-between sticky top-0 z-40">
	<!-- Left: macOS Traffic Lights + Sidebar Toggle + Active Studio Tab -->
	<div class="flex items-center gap-3">
		<!-- Traffic Lights -->
		<div class="flex items-center gap-1.5 shrink-0 hidden sm:flex">
			<span class="traffic-light-red"></span>
			<span class="traffic-light-yellow"></span>
			<span class="traffic-light-green"></span>
		</div>

		<!-- Sidebar Retract/Expand Button -->
		<button
			type="button"
			onclick={toggleSidebar}
			class="p-1.5 rounded-lg bg-[#f0f0ee] dark:bg-zinc-900/80 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 border border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-orange-500 transition-colors cursor-pointer flex items-center gap-1.5"
			title={isSidebarExpanded ? 'Retract Sidebar (Cmd+B)' : 'Expand Sidebar (Cmd+B)'}
			aria-label="Toggle Sidebar"
		>
			<PanelLeft class="w-4 h-4" />
			<span class="text-[10px] font-mono text-zinc-500 hidden xl:inline">⌘B</span>
		</button>

		<div class="h-4 w-px bg-[#e6e6e6] dark:bg-zinc-800 hidden sm:block"></div>

		<!-- Active Goal Tab -->
		{#if activeGoal}
			<a
				href={`/goals/${activeGoal.id}/roadmap`}
				class="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#f4f4f2] dark:bg-zinc-900/90 border border-[#e0e0dc] dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-xs font-mono transition-colors"
			>
				<Target class="w-3.5 h-3.5 text-orange-500" />
				<span class="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px] sm:max-w-[200px]">
					{activeGoal.title}
				</span>
				<span class="text-[10px] text-zinc-500 hidden sm:inline">Active Goal</span>
			</a>
		{:else}
			<a
				href="/goals/new"
				class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-500/30 hover:border-orange-400 text-xs font-mono text-orange-800 dark:text-orange-300 transition-colors font-bold"
			>
				<Target class="w-3.5 h-3.5 text-orange-500" />
				<span>+ Create Learning Goal</span>
			</a>
		{/if}
	</div>

	<!-- Center / Right: Theme Toggle + AI Agent Ada status badge + Quick Capture + User Profile -->
	<div class="flex items-center gap-3">
		<!-- Light / Dark Mode Toggle -->
		<ThemeToggle />

		<!-- Ada Status Pill -->
		{#if aiQuery.data}
			{@const ai = aiQuery.data}
			<a
				href="/settings"
				class="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono transition-all {ai.isOnline
					? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:border-emerald-400'
					: 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 hover:border-amber-400'}"
				title={ai.isOnline ? `Ada Online (${ai.model})` : 'Ada Offline — Click to configure OpenRouter API key'}
			>
				<Bot class="w-3.5 h-3.5 {ai.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}" />
				<span class="font-semibold text-[11px]">Ada: {ai.isOnline ? 'Online' : 'Offline'}</span>
			</a>
		{/if}

		<!-- Quick Capture Trigger -->
		<a
			href="/inbox"
			class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900/90 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 border border-[#e0e0dc] dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
		>
			<Zap class="w-3.5 h-3.5 text-orange-500" />
			<span>Quick Capture</span>
		</a>

		<!-- User Profile & Dropdown -->
		<UserDropdown {user} />
	</div>
</header>
