<script lang="ts">
	import { goto } from '$app/navigation';
	import type { User } from '$lib/types/domain';
	import { User as UserIcon, Settings, LogOut, Target, ShieldCheck, ChevronDown } from 'lucide-svelte';

	let { user } = $props<{ user: User | null }>();

	let isOpen = $state(false);
	let isLoggingOut = $state(false);

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function closeDropdown() {
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			closeDropdown();
		}
	}

	async function handleLogout() {
		isLoggingOut = true;
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			window.location.href = '/login';
		} catch (e) {
			console.error('Logout error:', e);
			window.location.href = '/login';
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={(e) => {
	const target = e.target as HTMLElement;
	if (isOpen && !target.closest('.user-dropdown-container')) {
		closeDropdown();
	}
}} />

<div class="relative user-dropdown-container">
	<!-- Trigger Avatar Button -->
	<button
		type="button"
		onclick={toggleDropdown}
		class="flex items-center gap-2.5 pl-2 border-l border-[#e6e6e6] dark:border-zinc-800 focus:outline-none cursor-pointer rounded-lg p-1 hover:bg-[#f4f4f2] dark:hover:bg-zinc-900/60 transition-colors"
		aria-expanded={isOpen}
		aria-haspopup="true"
		aria-label="User Account Menu"
	>
		<div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10">
			{user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
		</div>
		<div class="hidden lg:block text-left">
			<span class="block text-xs font-bold text-zinc-900 dark:text-zinc-200 leading-none truncate max-w-[120px]">
				{user?.name || 'Learner'}
			</span>
			<span class="block text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">Account</span>
		</div>
		<ChevronDown class="w-3 h-3 text-zinc-400 dark:text-zinc-500 hidden sm:block transition-transform duration-200 {isOpen ? 'rotate-180 text-orange-500' : ''}" />
	</button>

	<!-- Dropdown Menu Panel -->
	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#121316] border border-[#e6e6e6] dark:border-white/[0.08] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
			role="menu"
		>
			<!-- User Header Header Card -->
			<div class="p-4 bg-[#fafafa] dark:bg-zinc-950/80 border-b border-[#e6e6e6] dark:border-zinc-800 space-y-1.5">
				<div class="flex items-center gap-3">
					<div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0">
						{user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
					</div>
					<div class="truncate">
						<div class="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate font-display">
							{user?.name || 'Learner'}
						</div>
						<div class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
							{user?.email || 'learner@cognitiveos.local'}
						</div>
					</div>
				</div>

				<div class="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
					<ShieldCheck class="w-3.5 h-3.5" />
					<span>Authenticated Session</span>
				</div>
			</div>

			<!-- Navigation Links -->
			<div class="p-2 space-y-1 text-xs">
				<a
					href="/dashboard"
					onclick={closeDropdown}
					class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-[#f4f4f2] dark:hover:bg-zinc-900 transition-colors font-medium cursor-pointer"
					role="menuitem"
				>
					<UserIcon class="w-4 h-4 text-orange-500" />
					<span>Dashboard & Profile</span>
				</a>

				<a
					href="/goals"
					onclick={closeDropdown}
					class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-[#f4f4f2] dark:hover:bg-zinc-900 transition-colors font-medium cursor-pointer"
					role="menuitem"
				>
					<Target class="w-4 h-4 text-orange-500" />
					<span>My Learning Goals</span>
				</a>

				<a
					href="/settings"
					onclick={closeDropdown}
					class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-[#f4f4f2] dark:hover:bg-zinc-900 transition-colors font-medium cursor-pointer"
					role="menuitem"
				>
					<Settings class="w-4 h-4 text-orange-500" />
					<span>Settings & Configuration</span>
				</a>
			</div>

			<!-- Logout Action -->
			<div class="p-2 border-t border-[#e6e6e6] dark:border-zinc-800 bg-[#fcfcfb] dark:bg-zinc-950/40">
				<button
					type="button"
					onclick={handleLogout}
					disabled={isLoggingOut}
					class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
					role="menuitem"
				>
					<LogOut class="w-4 h-4" />
					<span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
				</button>
			</div>
		</div>
	{/if}
</div>
