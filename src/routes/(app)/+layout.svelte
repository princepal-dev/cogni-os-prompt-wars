<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';

	let { data, children } = $props();

	let user = $derived(data.user);
	let activeGoal = $derived(data.activeGoal);
	let goals = $derived(data.goals);
</script>

<div class="min-h-screen bg-[#f8f8f7] dark:bg-[#090a0b] flex flex-col text-[#111111] dark:text-zinc-100 antialiased selection:bg-orange-500/30 selection:text-orange-200 transition-colors duration-150">
	<!-- Top Navigation Studio Window Header -->
	<Navbar {user} {activeGoal} {goals} />

	<div class="flex-1 flex overflow-hidden">
		<!-- Left Retractable Studio Navigator Panel -->
		<Sidebar {activeGoal} />

		<!-- Main Studio Canvas Workspace -->
		<main class="flex-1 overflow-y-auto studio-canvas p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
			<div class="max-w-6xl mx-auto space-y-6">
				<!-- Active Route Content -->
				{@render children()}
			</div>
		</main>
	</div>
</div>
