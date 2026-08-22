<script lang="ts">
	import {
		Zap,
		Target,
		BookOpen,
		Layers,
		ListTodo,
		Inbox,
		Brain,
		Mic,
		Check,
		ArrowRight,
		Sparkles
	} from 'lucide-svelte';
</script>

<svelte:head>
	<title>CognitiveOS — Personal Adaptive Learning Operating System</title>
</svelte:head>

<div class="min-h-screen bg-white text-black font-sans selection:bg-[#dceeb1] selection:text-black">
	<!-- 1. TOP NAV (56px, design.md) -->
	<header class="h-14 border-b border-[#e6e6e6] bg-white sticky top-0 z-50 px-4 sm:px-8 flex items-center justify-between">
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center gap-2 text-black font-bold tracking-tight text-lg font-display">
				<span class="w-6 h-6 rounded-md bg-black text-white flex items-center justify-center text-xs font-mono font-bold">
					C
				</span>
				<span>CognitiveOS</span>
			</a>

			<nav class="hidden md:flex items-center gap-6 text-sm text-black/80 font-light" aria-label="Main Navigation">
				<a href="#features" class="hover:text-black transition-colors">Adaptive Architecture</a>
				<a href="#adaptive-loop" class="hover:text-black transition-colors">The Magic Moment</a>
				<a href="#second-brain" class="hover:text-black transition-colors">Second Brain</a>
				<a href="#pricing" class="hover:text-black transition-colors">Pricing</a>
			</nav>
		</div>

		<!-- Right: Action Pills -->
		<div class="flex items-center gap-3">
			<a href="/login" class="text-sm font-medium text-black px-3 py-1.5 hover:underline">
				Sign in
			</a>
			<a href="/dashboard" class="btn-secondary-pill text-xs hidden sm:inline-flex">
				Live Demo
			</a>
			<a href="/register" class="btn-primary-pill text-xs">
				Get started for free
			</a>
		</div>
	</header>

	<!-- 2. MARQUEE STRIP (36px, inverse-canvas, design.md) -->
	<div class="bg-black text-white h-9 flex items-center overflow-hidden border-b border-black text-xs font-mono tracking-wider uppercase">
		<div class="flex gap-12 whitespace-nowrap animate-marquee px-4">
			<span>Personal Learning OS</span>
			<span>•</span>
			<span>Second Brain + Obsidian Vault</span>
			<span>•</span>
			<span>AI Dynamic Roadmap Adaptation</span>
			<span>•</span>
			<span>Socratic Teach-Back Coach</span>
			<span>•</span>
			<span>SM-2 Spaced Flashcard Repetition</span>
			<span>•</span>
			<span>8-State Continuous Knowledge Model</span>
		</div>
	</div>

	<!-- 3. HERO SECTION (Monochrome Canvas, design.md) -->
	<section class="max-w-5xl mx-auto px-4 sm:px-8 pt-20 pb-16 text-center space-y-8">
		<div class="space-y-4">
			<div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f7f7f5] border border-[#e6e6e6] text-xs font-mono tracking-wide text-black/80">
				<Sparkles class="w-3.5 h-3.5 text-black" />
				<span>NEXT-GENERATION ADAPTIVE LEARNING INTELLIGENCE</span>
			</div>

			<h1 class="display-xl text-black font-display font-bold max-w-4xl mx-auto">
				Optimized for you. <br />Not everyone else.
			</h1>
		</div>

		<p class="text-lg sm:text-xl text-black/70 max-w-2xl mx-auto font-light leading-relaxed">
			Traditional education is one-size-fits-all. CognitiveOS continuously models your evolving knowledge state, detects learning gaps in real time, and auto-adapts your roadmap so you learn with maximum efficiency.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
			<a href="/register" class="btn-primary-pill text-base px-7 py-3 w-full sm:w-auto flex items-center justify-center gap-2">
				<span>Start Learning for Free</span>
				<ArrowRight class="w-4 h-4" />
			</a>
			<a href="/dashboard" class="btn-secondary-pill text-base px-7 py-3 w-full sm:w-auto flex items-center justify-center gap-2">
				<Zap class="w-4 h-4 text-black" />
				<span>Launch Interactive Dashboard</span>
			</a>
		</div>

		<!-- Hero App Preview in macOS Frame -->
		<div class="pt-8 max-w-5xl mx-auto">
			<div class="rounded-3xl border border-[#e6e6e6] bg-[#0c0d0e] p-4 sm:p-6 shadow-2xl text-left text-white space-y-4">
				<div class="flex items-center justify-between border-b border-zinc-800 pb-3">
					<div class="flex items-center gap-2">
						<span class="w-3 h-3 rounded-full bg-[#ef4444]"></span>
						<span class="w-3 h-3 rounded-full bg-[#f59e0b]"></span>
						<span class="w-3 h-3 rounded-full bg-[#10b981]"></span>
						<span class="ml-3 text-xs font-mono text-zinc-400">CognitiveOS Canvas — Graph Algorithms DSA v1.0</span>
					</div>
					<span class="px-2.5 py-0.5 rounded-full bg-orange-950 border border-orange-500/40 text-orange-300 font-mono text-[10px] font-bold">
						Continuous Adaptation Active
					</span>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
					<div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
						<span class="text-orange-400 font-mono font-bold uppercase text-[10px]">Today's Focus</span>
						<h3 class="font-bold text-sm text-zinc-100">DFS Stack Dynamics</h3>
						<p class="text-zinc-400 text-[11px] leading-relaxed">
							15m Refresher • Injected to secure recursion base cases before shortest paths.
						</p>
					</div>

					<div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
						<span class="text-emerald-400 font-mono font-bold uppercase text-[10px]">Knowledge Radar</span>
						<div class="flex items-center justify-between text-[11px]">
							<span class="text-zinc-300">BFS Queues</span>
							<span class="font-mono text-emerald-400 font-bold">STRONG (85%)</span>
						</div>
						<div class="flex items-center justify-between text-[11px]">
							<span class="text-zinc-300">Recursion Stack</span>
							<span class="font-mono text-orange-400 font-bold">DEVELOPING (45%)</span>
						</div>
					</div>

					<div class="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
						<span class="text-amber-400 font-mono font-bold uppercase text-[10px]">Feasibility Analysis</span>
						<h3 class="font-bold text-sm text-zinc-100">32h Required • 30 Days</h3>
						<p class="text-zinc-400 text-[11px] leading-relaxed">
							45 min/day pace is <strong class="text-emerald-400 font-semibold">100% Realistic</strong> with high-ROI interview filtering.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. PASTEL COLOR BLOCK 1: LILAC (#c5b0f4) — Meet Ada & The Socratic Loop -->
	<section id="features" class="max-w-6xl mx-auto px-4 sm:px-8 py-8">
		<div class="color-block color-block-lilac space-y-8">
			<div class="max-w-2xl space-y-3">
				<span class="eyebrow-mono text-black/70">AI INTELLIGENCE ARCHITECTURE</span>
				<h2 class="display-lg text-black font-display font-bold">
					Meet Ada. <br />Your Neural Learning Co-pilot.
				</h2>
				<p class="text-lg text-black/80 font-light leading-relaxed">
					Not a generic chatbot wrapper. Ada understands your knowledge state at the individual concept level, quizzes your comprehension with Socratic teach-backs, and surfaces invisible misconceptions before they compound.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
				<div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-black/10 space-y-3">
					<Mic class="w-6 h-6 text-black" />
					<h3 class="font-bold text-base text-black font-display">Socratic Teach-Back</h3>
					<p class="text-sm text-black/70 leading-relaxed font-light">
						Explain concepts in your own words. Ada scores Clarity, Depth, Correctness, and pinpoints exact missing invariants.
					</p>
				</div>

				<div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-black/10 space-y-3">
					<Zap class="w-6 h-6 text-black" />
					<h3 class="font-bold text-base text-black font-display">Prerequisite Injection</h3>
					<p class="text-sm text-black/70 leading-relaxed font-light">
						Struggle on recursive DFS? Ada instantly inserts a 20-minute recursion stack refresher and reschedules downstream topics.
					</p>
				</div>

				<div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-black/10 space-y-3">
					<Brain class="w-6 h-6 text-black" />
					<h3 class="font-bold text-base text-black font-display">Concept Extraction</h3>
					<p class="text-sm text-black/70 leading-relaxed font-light">
						Type notes in your Second Brain: Ada auto-detects concepts, links semantic relations, and generates 1-click flashcards.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 5. PASTEL COLOR BLOCK 2: LIME (#dceeb1) — The Magic Moment Adaptive Engine -->
	<section id="adaptive-loop" class="max-w-6xl mx-auto px-4 sm:px-8 py-8">
		<div class="color-block color-block-lime space-y-8">
			<div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div class="max-w-xl space-y-3">
					<span class="eyebrow-mono text-black/70">DYNAMIC RE-PLANNING ENGINE</span>
					<h2 class="display-lg text-black font-display font-bold">
						The Adaptive Loop in Action.
					</h2>
					<p class="text-lg text-black/80 font-light leading-relaxed">
						Static roadmaps break the moment you get stuck. CognitiveOS dynamically reshapes milestones when you struggle, ensuring you never build on a shaky foundation.
					</p>
				</div>

				<a href="/dashboard" class="btn-primary-pill text-sm shrink-0 flex items-center gap-1.5">
					<span>Test Live Adaptation Simulator</span>
					<ArrowRight class="w-4 h-4" />
				</a>
			</div>

			<!-- Visual Flow Comparison -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
				<div class="bg-white/70 rounded-2xl p-6 border border-black/10 space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-xs font-mono font-bold uppercase text-red-600">Traditional Static Courses</span>
						<span class="text-xs text-black/50">Rigid</span>
					</div>
					<p class="text-sm text-black/80">
						You fail a quiz on Recursion → The course moves forward to Dijkstra anyway → Frustration, cognitive overload, and abandonment.
					</p>
				</div>

				<div class="bg-black text-white rounded-2xl p-6 border border-black/20 space-y-3 shadow-lg">
					<div class="flex items-center justify-between">
						<span class="text-xs font-mono font-bold uppercase text-[#dceeb1]">CognitiveOS Adaptive Loop</span>
						<span class="text-xs text-white/50">Auto-Rebalanced</span>
					</div>
					<p class="text-sm text-white/90">
						You fail a probe → State shifts to <code class="text-orange-300">DEVELOPING</code> → Prerequisite Refresher injected → Daily plan adjusts → Mastery guaranteed.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 6. PASTEL COLOR BLOCK 3: CREAM (#f4ecd6) — Second Brain Meets Daily Execution -->
	<section id="second-brain" class="max-w-6xl mx-auto px-4 sm:px-8 py-8">
		<div class="color-block color-block-cream space-y-8">
			<div class="max-w-2xl space-y-3">
				<span class="eyebrow-mono text-black/70">SECOND BRAIN + OBSIDIAN + KANBAN</span>
				<h2 class="display-lg text-black font-display font-bold">
					Capture everything. <br />Act on what matters.
				</h2>
				<p class="text-lg text-black/80 font-light leading-relaxed">
					Your personal knowledge vault directly drives your daily learning itinerary. Second Brain notes, Kanban tasks, and SM-2 spaced repetition in one unified canvas.
				</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
				<div class="bg-white/90 rounded-2xl p-5 border border-black/10 space-y-2">
					<BookOpen class="w-5 h-5 text-black" />
					<h4 class="font-bold text-sm text-black">Markdown Notes</h4>
					<p class="text-xs text-black/70">Live preview, backlinking, and automated entity discovery.</p>
				</div>

				<div class="bg-white/90 rounded-2xl p-5 border border-black/10 space-y-2">
					<Layers class="w-5 h-5 text-black" />
					<h4 class="font-bold text-sm text-black">SM-2 Spaced Recall</h4>
					<p class="text-xs text-black/70">SuperMemo algorithm with optimal daily memory retention intervals.</p>
				</div>

				<div class="bg-white/90 rounded-2xl p-5 border border-black/10 space-y-2">
					<ListTodo class="w-5 h-5 text-black" />
					<h4 class="font-bold text-sm text-black">Learning Kanban</h4>
					<p class="text-xs text-black/70">5-stage learning workflow with why-justification tags on every task.</p>
				</div>

				<div class="bg-white/90 rounded-2xl p-5 border border-black/10 space-y-2">
					<Inbox class="w-5 h-5 text-black" />
					<h4 class="font-bold text-sm text-black">Universal Inbox</h4>
					<p class="text-xs text-black/70">Quick capture URLs, videos, questions, and ideas on the fly.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- 7. PASTEL COLOR BLOCK 4: NAVY (#1f1d3d) — Engineering Grade Performance -->
	<section class="max-w-6xl mx-auto px-4 sm:px-8 py-8">
		<div class="color-block color-block-navy space-y-8">
			<div class="max-w-2xl space-y-3">
				<span class="eyebrow-mono text-white/70">ZERO COMPROMISES</span>
				<h2 class="display-lg text-white font-display font-bold">
					Built for serious learners.
				</h2>
				<p class="text-lg text-white/80 font-light leading-relaxed">
					Dual-mode database architecture (Neon PostgreSQL + embedded zero-config storage), strict user isolation, OpenRouter AI integration with transparent offline fallback, and high-performance SvelteKit runes.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-4 pt-4">
				<a href="/register" class="btn-magenta-pill text-sm flex items-center gap-1.5">
					<span>Create Free Account</span>
					<ArrowRight class="w-4 h-4" />
				</a>
				<a href="/login" class="btn-secondary-pill text-sm">
					1-Click Evaluator Login
				</a>
			</div>
		</div>
	</section>

	<!-- 8. PRICING SECTION (design.md pricing tokens) -->
	<section id="pricing" class="max-w-5xl mx-auto px-4 sm:px-8 py-20 text-center space-y-12">
		<div class="space-y-3">
			<span class="eyebrow-mono text-black/60">PRICING & ACCESS</span>
			<h2 class="display-lg text-black font-display font-bold">Simple, transparent access.</h2>
			<p class="text-black/70 text-base max-w-md mx-auto">Start free today. Connect OpenRouter whenever you want live multi-model reasoning.</p>
		</div>

		<!-- Pricing Cards Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
			<!-- Free Tier -->
			<div class="bg-white rounded-3xl p-8 border border-[#e6e6e6] shadow-sm space-y-6 flex flex-col justify-between">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-xl font-bold font-display">Starter Learner</h3>
						<span class="px-3 py-1 rounded-full bg-[#f7f7f5] text-black text-xs font-mono font-semibold">Free Forever</span>
					</div>
					<div class="text-3xl font-extrabold font-display">$0 <span class="text-xs text-black/50 font-normal">/ month</span></div>
					<p class="text-xs text-black/70 leading-relaxed">Complete personal adaptive learning OS with embedded persistent storage.</p>

					<ul class="space-y-2.5 text-xs text-black/80 pt-2 border-t border-[#f1f1f1]">
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Unlimited Learning Goals & Roadmaps</span>
						</li>
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Second Brain Markdown & Note Linking</span>
						</li>
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>SM-2 Spaced Flashcard Review Decks</span>
						</li>
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Learning-Aware Kanban & Daily Itinerary</span>
						</li>
					</ul>
				</div>

				<a href="/register" class="btn-secondary-pill text-xs w-full text-center">
					Get Started Free
				</a>
			</div>

			<!-- Pro Tier -->
			<div class="bg-black text-white rounded-3xl p-8 border border-black shadow-xl space-y-6 flex flex-col justify-between">
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<h3 class="text-xl font-bold font-display">Neural Pro</h3>
						<span class="px-3 py-1 rounded-full bg-[#dceeb1] text-black text-xs font-mono font-bold">BYO-Key Supported</span>
					</div>
					<div class="text-3xl font-extrabold font-display text-[#dceeb1]">$0 <span class="text-xs text-white/50 font-normal">/ month (BYO API Key)</span></div>
					<p class="text-xs text-white/70 leading-relaxed">Full power of Ada with Claude 3.5 Sonnet, Gemini 2.0 Flash, and GPT-4o.</p>

					<ul class="space-y-2.5 text-xs text-white/90 pt-2 border-t border-white/10">
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Live OpenRouter LLM Synthesis & Reasoning</span>
						</li>
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Real-Time Socratic Teach-Back AI Grading</span>
						</li>
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Automated Note Concept & Flashcard Generation</span>
						</li>
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-[#1ea64a] shrink-0" />
							<span>Continuous 8-State Knowledge Tracking</span>
						</li>
					</ul>
				</div>

				<a href="/register" class="btn-magenta-pill text-xs w-full text-center">
					Activate Neural Pro
				</a>
			</div>
		</div>
	</section>

	<!-- 9. FOOTER (design.md monochrome footer) -->
	<footer class="border-t border-[#e6e6e6] bg-white py-16 px-4 sm:px-8 text-black">
		<div class="max-w-6xl mx-auto space-y-12">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<div class="space-y-3">
					<div class="text-xl font-bold font-display tracking-tight">CognitiveOS</div>
					<p class="text-xs text-black/60 max-w-sm leading-relaxed">
						Personal Adaptive Learning Operating System. Built with Bun, SvelteKit, TypeScript, Tailwind CSS, and OpenRouter AI.
					</p>
				</div>

				<div class="space-y-2 text-xs">
					<span class="font-mono uppercase font-bold text-black/50 text-[10px] block">Product</span>
					<a href="/dashboard" class="block text-black/70 hover:text-black">Dashboard</a>
					<a href="/goals" class="block text-black/70 hover:text-black">My Goals</a>
					<a href="/goals/new" class="block text-black/70 hover:text-black">New Goal Wizard</a>
					<a href="/inbox" class="block text-black/70 hover:text-black">Universal Inbox</a>
					<a href="/settings" class="block text-black/70 hover:text-black">Settings & Keys</a>
				</div>

				<div class="space-y-2 text-xs">
					<span class="font-mono uppercase font-bold text-black/50 text-[10px] block">Intelligence</span>
					<span class="block text-black/70">AI Agent: Ada</span>
					<span class="block text-black/70">Dynamic Adaptation</span>
					<span class="block text-black/70">Socratic Coach</span>
					<span class="block text-black/70">SM-2 Spaced Repetition</span>
				</div>

				<div class="space-y-2 text-xs">
					<span class="font-mono uppercase font-bold text-black/50 text-[10px] block">Account</span>
					<a href="/login" class="block text-black/70 hover:text-black">Sign In</a>
					<a href="/register" class="block text-black/70 hover:text-black">Create Account</a>
					<a href="/dashboard" class="block text-black/70 hover:text-black">1-Click Evaluator Demo</a>
				</div>
			</div>

			<div class="pt-8 border-t border-[#f1f1f1] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] font-mono text-black/50">
				<span>© 2026 CognitiveOS. All rights reserved.</span>
				<span>Personal Adaptive Learning Intelligence OS</span>
			</div>
		</div>
	</footer>
</div>
