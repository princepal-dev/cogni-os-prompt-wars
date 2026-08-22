<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore, type Theme } from '$lib/stores/theme.store';
	import { Sun, Moon } from 'lucide-svelte';

	let currentTheme = $state<Theme>('dark');

	themeStore.subscribe((val) => {
		currentTheme = val;
	});

	onMount(() => {
		themeStore.init();
	});

	function toggle() {
		themeStore.toggleTheme();
	}
</script>

<button
	type="button"
	onclick={toggle}
	class="p-2 rounded-xl bg-[#f0f0ee] dark:bg-zinc-900/80 hover:bg-[#e4e4e1] dark:hover:bg-zinc-800 border border-[#e0e0dc] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all cursor-pointer flex items-center justify-center group shadow-sm"
	title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
	aria-label="Toggle Theme"
>
	{#if currentTheme === 'dark'}
		<Sun class="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
	{:else}
		<Moon class="w-4 h-4 text-zinc-700 group-hover:-rotate-12 transition-transform" />
	{/if}
</button>
