<script lang="ts">
	import MarkdownEditor from '$lib/components/notes/MarkdownEditor.svelte';
	import AiAgentBanner from '$lib/components/ai/AiAgentBanner.svelte';
	import type { Note } from '$lib/types/domain';
	import { BookOpen, Plus, Hash, FileText } from 'lucide-svelte';

	let { data } = $props();

	let notes = $state<Note[]>([]);
	let selectedNoteId = $state<string>('new');

	$effect(() => {
		notes = (data.notes || []) as Note[];
		if (notes.length > 0 && selectedNoteId === 'new') {
			selectedNoteId = notes[0].id;
		}
	});

	let activeNote = $derived(
		notes.find((n) => n.id === selectedNoteId) || {
			id: 'new',
			goalId: data.goal?.id || '',
			userId: '',
			title: 'New Study Note',
			markdownContent: '',
			extractedConcepts: [],
			suggestedConnections: [],
			backlinks: [],
			createdAt: '',
			updatedAt: ''
		}
	);

	function handleNewNote() {
		const newNote: Note = {
			id: `note-${Date.now()}`,
			goalId: data.goal?.id || '',
			userId: '',
			title: 'Untitled Note',
			markdownContent: '',
			extractedConcepts: [],
			suggestedConnections: [],
			backlinks: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		notes = [newNote, ...notes];
		selectedNoteId = newNote.id;
	}

	function onNoteSaved(saved: Note) {
		const idx = notes.findIndex((n) => n.id === saved.id);
		if (idx >= 0) {
			notes[idx] = saved;
		} else {
			notes = [saved, ...notes];
		}
		selectedNoteId = saved.id;
	}
</script>

<svelte:head>
	<title>Second Brain Notes — CognitiveOS</title>
</svelte:head>

<div class="space-y-6 animate-in fade-in duration-200">
	<AiAgentBanner />

	<!-- Header with macOS Traffic Lights -->
	<div class="studio-window rounded-2xl p-5 border border-zinc-800 shadow-xl flex items-center justify-between">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<div class="flex items-center gap-1.5 shrink-0">
					<span class="traffic-light-red"></span>
					<span class="traffic-light-yellow"></span>
					<span class="traffic-light-green"></span>
				</div>
				<span class="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">Second Brain</span>
				<span class="text-xs text-zinc-500">•</span>
				<span class="text-xs text-zinc-400 font-mono">{notes.length} Notes Captured</span>
			</div>
			<h1 class="text-xl font-bold text-zinc-100 font-display">Notes & Knowledge Extraction</h1>
		</div>

		<button
			type="button"
			onclick={handleNewNote}
			class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
		>
			<Plus class="w-4 h-4" />
			<span>New Note</span>
		</button>
	</div>

	<!-- Notes Studio Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
		<!-- Left (4 cols): Note Navigation list -->
		<div class="lg:col-span-4 space-y-2">
			{#each notes as note}
				{@const isSelected = note.id === selectedNoteId}
				<button
					type="button"
					onclick={() => (selectedNoteId = note.id)}
					class="w-full text-left p-4 rounded-xl border transition-all cursor-pointer {isSelected
						? 'bg-orange-950/40 border-orange-500/60 shadow-md'
						: 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'}"
				>
					<h3 class="text-xs font-bold text-zinc-200 truncate">{note.title}</h3>
					<p class="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
						{note.markdownContent.replace(/^[#*`\s]+/gm, '') || 'No content yet...'}
					</p>
					{#if note.extractedConcepts?.length > 0}
						<div class="flex flex-wrap gap-1 mt-2">
							{#each note.extractedConcepts.slice(0, 2) as tag}
								<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-750 text-orange-300">
									#{tag}
								</span>
							{/each}
						</div>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Right (8 cols): Active Markdown Editor & AI Insights -->
		<div class="lg:col-span-8">
			<MarkdownEditor
				note={activeNote}
				goalId={data.goal?.id || ''}
				onSave={onNoteSaved}
			/>
		</div>
	</div>
</div>
