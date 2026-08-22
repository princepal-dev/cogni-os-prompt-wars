<script lang="ts">
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let errorMessage = $state<string | null>(null);

	async function handleRegister() {
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}
		isSubmitting = true;
		errorMessage = null;
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});
			const json = await res.json();
			if (json.success) {
				goto('/goals/new');
			} else {
				errorMessage = json.error?.message || 'Registration failed';
			}
		} catch (e: any) {
			errorMessage = e.message;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign Up — CognitiveOS</title>
</svelte:head>

<div class="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-[#dceeb1]">
	<!-- Top Bar -->
	<div class="p-6 max-w-6xl mx-auto w-full flex items-center justify-between">
		<a href="/" class="flex items-center gap-2">
			<span class="w-6 h-6 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold font-mono">
				🧠
			</span>
			<span class="font-extrabold text-lg tracking-tight font-display text-black">CognitiveOS</span>
		</a>
		<a href="/login" class="text-xs font-medium text-black/70 hover:text-black">
			Sign in →
		</a>
	</div>

	<!-- Main Card with Lime Accent Frame -->
	<div class="flex-1 flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-white rounded-3xl p-8 border border-[#e6e6e6] shadow-xl space-y-6">
			<div class="text-center space-y-1">
				<div class="w-12 h-12 rounded-2xl bg-[#dceeb1] flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
					🚀
				</div>
				<h1 class="text-2xl font-bold text-black font-display">Create Your Account</h1>
				<p class="text-xs text-black/60 font-light">Join CognitiveOS Personal Learning OS</p>
			</div>

			{#if errorMessage}
				<div class="p-3 rounded-xl bg-[#efd4d4] border border-red-300 text-xs text-red-900 font-medium">
					{errorMessage}
				</div>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleRegister(); }} class="space-y-4 text-left">
				<div>
					<label for="signup-name" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
						Your Full Name:
					</label>
					<input
						id="signup-name"
						type="text"
						bind:value={name}
						required
						placeholder="Alex Learner"
						class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-medium"
					/>
				</div>

				<div>
					<label for="signup-email" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
						Email Address:
					</label>
					<input
						id="signup-email"
						type="email"
						bind:value={email}
						required
						placeholder="alex@learner.com"
						class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-medium"
					/>
				</div>

				<div>
					<label for="signup-pass" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
						Password (min 6 chars):
					</label>
					<input
						id="signup-pass"
						type="password"
						bind:value={password}
						required
						minlength="6"
						class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-medium"
					/>
				</div>

				<div>
					<label for="signup-confirm-pass" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
						Confirm Password:
					</label>
					<input
						id="signup-confirm-pass"
						type="password"
						bind:value={confirmPassword}
						required
						minlength="6"
						class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-medium"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="btn-primary-pill w-full py-3 text-xs justify-center"
				>
					{isSubmitting ? 'Creating Account...' : 'Get Started & Create Goal →'}
				</button>
			</form>

			<div class="text-center text-xs text-black/60 pt-2">
				Already have an account?
				<a href="/login" class="text-black font-bold underline ml-1">Sign In</a>
			</div>
		</div>
	</div>

	<!-- Minimal Footer -->
	<div class="p-6 text-center text-xs text-black/40 font-mono">
		© 2026 CognitiveOS • Built for serious learners
	</div>
</div>
