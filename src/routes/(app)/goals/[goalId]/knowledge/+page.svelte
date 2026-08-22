<script lang="ts">
	import KnowledgeGraphView from '$lib/components/knowledge/KnowledgeGraphView.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Knowledge Graph — CognitiveOS</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<AiAgentBanner />

	<KnowledgeGraphView
		conceptsWithState={data.conceptsWithState}
		timelineEvents={data.timelineEvents}
	/>
</div>
