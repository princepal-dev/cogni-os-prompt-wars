<script lang="ts">
	import confetti from 'canvas-confetti';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { DailyPlan } from '$lib/types/domain';
	import { BookOpen, Code, Play, PenTool, Zap, Check, ArrowRight, Clock } from 'lucide-svelte';

	let { data } = $props();

	let goal = $derived(data.goal);
	let dailyPlan = $derived(data.dailyPlan as DailyPlan);
	let activeTab = $state<'explain' | 'example' | 'try' | 'notes'>('explain');
	let userCode = $state(`function dfs(graph: Record<string, string[]>, start: string, visited = new Set<string>()): string[] {
    visited.add(start);
    const order = [start];
    
    for (const neighbor of graph[start] || []) {
        if (!visited.has(neighbor)) {
            order.push(...dfs(graph, neighbor, visited));
        }
    }
    return order;
}`);
	let runOutput = $state<string | null>(null);
	let noteDraft = $state('DFS explores as deep as possible along each branch before backtracking. Requires a visited set to avoid infinite cycles.');

	const exampleCode = `// TypeScript Graph DFS Traversal
function depthFirstSearch(
    adjList: Map<string, string[]>, 
    startNode: string, 
    visited: Set<string> = new Set()
): string[] {
    visited.add(startNode);
    const traversalOrder: string[] = [startNode];

    const neighbors = adjList.get(startNode) || [];
    for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
            // Recursive dive into neighbor branch
            const subOrder = depthFirstSearch(adjList, neighbor, visited);
            traversalOrder.push(...subOrder);
        }
    }

    return traversalOrder;
}`;

	function runCodeSimulation() {
		runOutput = `Running DFS Traversal Simulation on Graph:
Graph = { "A": ["B", "C"], "B": ["D"], "C": ["E"], "D": [], "E": [] }

Call Stack:
1. dfs("A") -> visits A, pushes "A"
2. dfs("B") -> visits B, pushes "B"
3. dfs("D") -> visits D (leaf), returns ["D"]
4. returns to "A", explores next neighbor "C"
5. dfs("C") -> visits C, pushes "C"
6. dfs("E") -> visits E (leaf), returns ["E"]

Traversal Result: ["A", "B", "D", "C", "E"]
Status: Passed all invariants. Call stack unwind verified!`;
		try {
			confetti({ particleCount: 50, spread: 50 });
		} catch (e) {}
	}
</script>

<svelte:head>
	<title>Focused Learn Mode — CognitiveOS</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
	<AiAgentBanner />

	<!-- Focused Session Header with macOS Traffic Lights -->
	<div class="studio-window rounded-2xl p-6 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Focused Study Session</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs font-mono text-zinc-400">Step 2 of 4 (15 min)</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-100 font-display">
				Depth-First Search (DFS) & Recursion Dynamics
			</h1>
		</div>

		<div class="flex items-center gap-2">
			<a
				href={goal ? `/goals/${goal.id}/quiz` : '/goals'}
				class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
			>
				<span>Next: Quiz Me</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>
	</div>

	<!-- Orientation Bar: Where am I? Why? What's next? -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
		<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
			<span class="text-zinc-500 block text-[10px] uppercase">Where am I?</span>
			<strong class="text-zinc-200">Traversals Milestone (Week 1)</strong>
		</div>
		<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
			<span class="text-zinc-500 block text-[10px] uppercase">Why am I doing this?</span>
			<strong class="text-orange-300">Prerequisite for Cycle Detection</strong>
		</div>
		<div class="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
			<span class="text-zinc-500 block text-[10px] uppercase">What's next?</span>
			<strong class="text-emerald-300">2 Interactive Problems (15m)</strong>
		</div>
	</div>

	<!-- Interactive Tab Navigation -->
	<div class="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/90 border border-zinc-800 text-xs font-medium overflow-x-auto">
		<button
			type="button"
			onclick={() => (activeTab = 'explain')}
			class="px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 {activeTab === 'explain'
				? 'bg-orange-600 text-white font-semibold shadow-sm'
				: 'text-zinc-400 hover:text-zinc-200'}"
		>
			<BookOpen class="w-3.5 h-3.5" />
			<span>Explanation</span>
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'example')}
			class="px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 {activeTab === 'example'
				? 'bg-orange-600 text-white font-semibold shadow-sm'
				: 'text-zinc-400 hover:text-zinc-200'}"
		>
			<Code class="w-3.5 h-3.5" />
			<span>Code Walkthrough</span>
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'try')}
			class="px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 {activeTab === 'try'
				? 'bg-orange-600 text-white font-semibold shadow-sm'
				: 'text-zinc-400 hover:text-zinc-200'}"
		>
			<Play class="w-3.5 h-3.5" />
			<span>Try It Sandbox</span>
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'notes')}
			class="px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 {activeTab === 'notes'
				? 'bg-orange-600 text-white font-semibold shadow-sm'
				: 'text-zinc-400 hover:text-zinc-200'}"
		>
			<PenTool class="w-3.5 h-3.5" />
			<span>Quick Notes</span>
		</button>
	</div>

	<!-- Tab Content Box -->
	<div class="studio-window rounded-2xl p-6 border border-zinc-800 shadow-xl min-h-[380px]">
		{#if activeTab === 'explain'}
			<div class="space-y-4 text-xs leading-relaxed text-zinc-300">
				<h3 class="text-base font-bold text-zinc-100 font-display">How DFS Recursion Works</h3>
				<p>
					Depth-First Search traverses a graph by plunging as deep as possible along each branch before backtracking.
					Unlike BFS which explores vertices layer-by-layer using a FIFO Queue, DFS naturally utilizes a <strong>LIFO Call Stack</strong>.
				</p>

				<div class="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] space-y-2 text-orange-200">
					<p class="font-bold text-zinc-100">The 3 Critical Invariants of DFS:</p>
					<p>1. <strong>Base Case / Termination:</strong> Stop exploring when a vertex has no unvisited neighbors.</p>
					<p>2. <strong>Visited Tracking:</strong> Mark vertices in a visited Set upon entry to prevent infinite cycles in cyclic/undirected graphs.</p>
					<p>3. <strong>Backtracking Unwind:</strong> When returning from a recursive call, previous local state is automatically restored from the call stack frame.</p>
				</div>

				<h4 class="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono pt-2">Complexity Analysis</h4>
				<p>
					Time: <code class="text-orange-300">O(V + E)</code> using an Adjacency List, because every vertex and edge is checked once.<br />
					Space: <code class="text-orange-300">O(V)</code> in the worst case (e.g. a linear line graph where the recursion call stack depth equals V).
				</p>
			</div>

		{:else if activeTab === 'example'}
			<div class="space-y-4">
				<h3 class="text-sm font-bold text-zinc-100">Standard Recursive DFS Implementation</h3>
				<pre class="bg-zinc-950 rounded-xl p-4 text-xs font-mono text-orange-200 border border-zinc-800 overflow-x-auto leading-relaxed"><code>{exampleCode}</code></pre>
			</div>

		{:else if activeTab === 'try'}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h3 class="text-xs font-bold text-zinc-200">Interactive Sandbox (Verify Call Stack)</h3>
					<button
						type="button"
						onclick={runCodeSimulation}
						class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
					>
						<Play class="w-3 h-3 fill-white" />
						<span>Run & Verify</span>
					</button>
				</div>

				<textarea
					bind:value={userCode}
					rows="8"
					class="w-full bg-zinc-950 rounded-xl p-3.5 text-xs font-mono text-orange-200 border border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed"
				></textarea>

				{#if runOutput}
					<div class="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-150">
						{runOutput}
					</div>
				{/if}
			</div>

		{:else if activeTab === 'notes'}
			<div class="space-y-4">
				<h3 class="text-xs font-bold text-zinc-200">Session Quick Capture</h3>
				<textarea
					bind:value={noteDraft}
					rows="8"
					class="w-full bg-zinc-950 rounded-xl p-4 text-xs font-mono text-zinc-200 border border-zinc-800 focus:outline-none focus:border-orange-500 leading-relaxed"
				></textarea>
				<button
					type="button"
					onclick={() => alert('Note saved to Second Brain!')}
					class="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer"
				>
					Save to Second Brain
				</button>
			</div>
		{/if}
	</div>
</div>
