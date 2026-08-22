<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { uiStore } from '$lib/stores/ui.store';
	import type { LearningGoal } from '$lib/types/domain';
	import {
		LayoutDashboard,
		Map,
		Target,
		Zap,
		BookOpen,
		ListTodo,
		HelpCircle,
		Layers,
		MessageSquare,
		Brain,
		Library,
		Inbox,
		Settings,
		Search,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';

	let { activeGoal } = $props<{ activeGoal: LearningGoal | null }>();

	let activeSection = $state<'pages' | 'brain'>('pages');
	let filterQuery = $state('');
	let hoveredTooltip = $state<string | null>(null);

	let goalId = $derived(activeGoal?.id || 'active');
	let isExpanded = $derived($uiStore.sidebarExpanded);

	let navItems = $derived([
		{ href: '/dashboard', label: 'Dashboard', route: '/home', icon: LayoutDashboard, tag: 'Studio Canvas' },
		{ href: `/goals/${goalId}/roadmap`, label: 'Roadmap', route: '/roadmap', icon: Map, tag: 'Milestones' },
		{ href: '/goals', label: 'My Goals', route: '/goals', icon: Target, tag: 'Goals List' },
		{ href: `/goals/${goalId}/learn`, label: 'Learn Mode', route: '/learn', icon: Zap, tag: 'Focused Study' },
		{ href: `/goals/${goalId}/notes`, label: 'Second Brain', route: '/notes', icon: BookOpen, tag: 'Markdown Notes' },
		{ href: `/goals/${goalId}/tasks`, label: 'Tasks', route: '/tasks', icon: ListTodo, tag: 'Learning Kanban' },
		{ href: `/goals/${goalId}/quiz`, label: 'Diagnostic Quiz', route: '/quiz', icon: HelpCircle, tag: 'Adaptive Probes' },
		{ href: `/goals/${goalId}/flashcards`, label: 'Flashcards', route: '/flashcards', icon: Layers, tag: 'SM-2 Recall' },
		{ href: `/goals/${goalId}/teach-back`, label: 'Socratic Coach', route: '/teach-back', icon: MessageSquare, tag: 'Teach Me' },
		{ href: `/goals/${goalId}/knowledge`, label: 'Knowledge Map', route: '/knowledge', icon: Brain, tag: '8-State Radar' },
		{ href: `/goals/${goalId}/resources`, label: 'Resources', route: '/resources', icon: Library, tag: 'Curated' },
		{ href: '/inbox', label: 'Inbox', route: '/inbox', icon: Inbox, tag: 'Quick Capture' },
		{ href: '/settings', label: 'Settings', route: '/settings', icon: Settings, tag: 'AI & DB Config' }
	]);

	let filteredItems = $derived(
		navItems.filter(
			(i) =>
				i.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
				i.route.toLowerCase().includes(filterQuery.toLowerCase()) ||
				i.tag.toLowerCase().includes(filterQuery.toLowerCase())
		)
	);

	function toggleSidebar() {
		uiStore.toggleSidebar();
	}

	onMount(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
				e.preventDefault();
				toggleSidebar();
			}
		}
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<!-- Mobile Backdrop Overlay when sidebar is open on small screens -->
{#if isExpanded}
	<button
		type="button"
		onclick={toggleSidebar}
		class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden border-0 cursor-pointer"
		aria-label="Close Sidebar Overlay"
	></button>
{/if}

<aside
	class="shrink-0 bg-white dark:bg-[#0c0d0e] border-r border-[#e6e6e6] dark:border-zinc-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out z-40 fixed inset-y-0 left-0 lg:static {isExpanded
		? 'w-64 translate-x-0'
		: 'w-16 -translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none select-none"
>
	<!-- Top Section: Navigation Header & Items -->
	<div class="p-3 space-y-3 overflow-y-auto flex-1">
		{#if isExpanded}
			<!-- Expanded Sidebar Top Header Controls -->
			<div class="space-y-3 pb-2 border-b border-[#e6e6e6] dark:border-zinc-800/70">
				<div class="flex items-center justify-between px-1">
					<div class="flex items-center gap-2">
						<span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
						<span class="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-300">CognitiveOS</span>
					</div>

					<div class="flex items-center gap-1">
						<button
							type="button"
							onclick={toggleSidebar}
							class="p-1 rounded-lg hover:bg-[#f0f0ee] dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors cursor-pointer"
							title="Collapse Sidebar (⌘B)"
							aria-label="Collapse Sidebar"
						>
							<ChevronLeft class="w-4 h-4" />
						</button>
					</div>
				</div>

				<!-- Quick Filter / Search Bar -->
				<div class="relative">
					<Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
					<input
						type="text"
						bind:value={filterQuery}
						placeholder="Search studio modules..."
						class="w-full bg-[#f4f4f2] dark:bg-zinc-950/80 border border-[#e0e0dc] dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors font-mono"
					/>
				</div>

				<!-- Segment Switcher (Pages vs Modules) -->
				<div class="grid grid-cols-2 p-0.5 rounded-lg bg-[#f0f0ee] dark:bg-zinc-950 border border-[#e0e0dc] dark:border-zinc-800/80 text-[11px] font-mono">
					<button
						type="button"
						onclick={() => (activeSection = 'pages')}
						class="py-1 rounded-md text-center transition-all cursor-pointer {activeSection === 'pages'
							? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 font-bold shadow-sm'
							: 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
					>
						Pages
					</button>
					<button
						type="button"
						onclick={() => (activeSection = 'brain')}
						class="py-1 rounded-md text-center transition-all cursor-pointer {activeSection === 'brain'
							? 'bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 font-bold shadow-sm'
							: 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200'}"
					>
						Modules
					</button>
				</div>
			</div>
		{:else}
			<!-- Collapsed Mode Expand Button -->
			<div class="flex justify-center pb-2 border-b border-[#e6e6e6] dark:border-zinc-800/70">
				<button
					type="button"
					onclick={toggleSidebar}
					class="p-2 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900/80 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 transition-all cursor-pointer group"
					title="Expand Sidebar (⌘B)"
					aria-label="Expand Sidebar"
				>
					<ChevronRight class="w-4 h-4 group-hover:scale-110 transition-transform" />
				</button>
			</div>
		{/if}

		<!-- Navigation Items List -->
		<nav class="space-y-1 pt-1" aria-label="Sidebar Navigation">
			{#each filteredItems as item}
				{@const Icon = item.icon}
				{@const isActive =
					page.url.pathname === item.href ||
					(item.href !== '/dashboard' && item.href !== '/goals' && page.url.pathname.startsWith(item.href))}

				{#if isExpanded}
					<!-- Expanded Item with Label and Tag -->
					<a
						href={item.href}
						class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all font-mono {isActive
							? 'active-pill-orange font-semibold shadow-md'
							: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 hover:bg-[#f4f4f2] dark:hover:bg-zinc-900/60'}"
					>
						<div class="flex items-center gap-2.5 truncate">
							<Icon class="w-4 h-4 shrink-0 {isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'}" />
							<span class="truncate">{item.label}</span>
						</div>
						{#if !isActive}
							<span class="text-[10px] text-zinc-400 dark:text-zinc-600 font-sans">{item.route}</span>
						{/if}
					</a>
				{:else}
					<!-- Collapsed Icon Only Mode with Floating Tooltip -->
					<div class="relative group flex justify-center">
						<a
							href={item.href}
							onmouseenter={() => (hoveredTooltip = item.label)}
							onmouseleave={() => (hoveredTooltip = null)}
							class="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative {isActive
								? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 shadow-sm'
								: 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 hover:bg-[#f4f4f2] dark:hover:bg-zinc-900'}"
							aria-label={item.label}
						>
							<Icon class="w-4 h-4" />
							{#if isActive}
								<span class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-orange-500"></span>
							{/if}
						</a>

						<!-- Floating Tooltip Popover -->
						{#if hoveredTooltip === item.label}
							<div
								class="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-100 text-xs font-mono border border-zinc-700 shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100"
							>
								<div class="font-bold flex items-center gap-1.5">
									<span>{item.label}</span>
								</div>
								<span class="text-[10px] text-zinc-400 block">{item.tag}</span>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</nav>
	</div>

	<!-- Bottom Section: Active Goal & System Indicator -->
	<div class="p-3 border-t border-[#e6e6e6] dark:border-zinc-800/80 bg-[#fafafa] dark:bg-zinc-950/60">
		{#if isExpanded}
			<div class="space-y-2">
				<div class="p-2.5 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900/80 border border-[#e0e0dc] dark:border-zinc-800 text-xs space-y-1">
					<div class="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
						<span class="flex items-center gap-1">
							<Target class="w-3 h-3 text-orange-500" />
							<span>Active Focus</span>
						</span>
						<span class="text-orange-500 font-bold">78% Mastered</span>
					</div>
					<div class="text-[11px] font-bold text-zinc-900 dark:text-zinc-200 truncate">
						{activeGoal ? activeGoal.title : 'No active goal'}
					</div>
				</div>

				<div class="flex items-center justify-between px-1 text-[10px] font-mono text-zinc-500">
					<span>CognitiveOS v2.4</span>
					<kbd class="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-[#e0e0dc] dark:border-zinc-800 text-[9px] text-zinc-600 dark:text-zinc-400">⌘B</kbd>
				</div>
			</div>
		{:else}
			<div class="flex justify-center">
				<a
					href={goalId ? `/goals/${goalId}/roadmap` : '/goals/new'}
					class="w-10 h-10 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900 flex items-center justify-center text-xs hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 transition-colors border border-[#e0e0dc] dark:border-zinc-800 text-orange-500"
					title="Active Goal: {activeGoal?.title || 'None'}"
				>
					<Target class="w-4 h-4" />
				</a>
			</div>
		{/if}
	</div>
</aside>
