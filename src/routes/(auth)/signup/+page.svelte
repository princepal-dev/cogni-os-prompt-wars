<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/register', { replaceState: true });
	});
</script>

<svelte:head>
	<title>Redirecting to Register — CognitiveOS</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center font-mono text-xs text-zinc-500">
	Redirecting to registration...
</div>
