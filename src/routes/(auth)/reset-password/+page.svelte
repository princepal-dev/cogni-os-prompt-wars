<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let token = $state(page.url.searchParams.get('token') || '');
	let password = $state('');
	let confirmPassword = $state('');
	let isSubmitting = $state(false);
	let successMessage = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	async function handleReset() {
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}
		if (password.length < 6) {
			errorMessage = 'Password must be at least 6 characters long';
			return;
		}
		if (!token) {
			errorMessage = 'Reset token is missing or invalid';
			return;
		}

		isSubmitting = true;
		errorMessage = null;
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password })
			});
			const json = await res.json();
			if (json.success) {
				successMessage = json.data.message;
				setTimeout(() => {
					goto('/login');
				}, 2000);
			} else {
				errorMessage = json.error?.message || 'Password reset failed';
			}
		} catch (e: any) {
			errorMessage = e.message;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create New Password — CognitiveOS</title>
</svelte:head>

<div class="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-[#dceeb1]">
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

	<div class="flex-1 flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-white rounded-3xl p-8 border border-[#e6e6e6] shadow-xl space-y-6">
			<div class="text-center space-y-1">
				<div class="w-12 h-12 rounded-2xl bg-[#dceeb1] flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
					🔒
				</div>
				<h1 class="text-2xl font-bold text-black font-display">Enter New Password</h1>
				<p class="text-xs text-black/60 font-light">Set a secure password for your CognitiveOS account.</p>
			</div>

			{#if successMessage}
				<div class="p-4 rounded-xl bg-[#c8e6cd] border border-[#1ea64a]/30 text-xs text-green-900 font-medium">
					{successMessage} Redirecting to login...
				</div>
			{/if}

			{#if errorMessage}
				<div class="p-3 rounded-xl bg-[#efd4d4] border border-red-300 text-xs text-red-900 font-medium">
					{errorMessage}
				</div>
			{/if}

			{#if !successMessage}
				<form onsubmit={(e) => { e.preventDefault(); handleReset(); }} class="space-y-4 text-left">
					{#if !token}
						<div>
							<label for="reset-token-input" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
								Reset Token:
							</label>
							<input
								id="reset-token-input"
								type="text"
								bind:value={token}
								required
								placeholder="Paste token from email"
								class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-mono"
							/>
						</div>
					{/if}

					<div>
						<label for="reset-new-pass" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
							New Password (min 6 chars):
						</label>
						<input
							id="reset-new-pass"
							type="password"
							bind:value={password}
							required
							minlength="6"
							class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-medium"
						/>
					</div>

					<div>
						<label for="reset-confirm-pass" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
							Confirm New Password:
						</label>
						<input
							id="reset-confirm-pass"
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
						{isSubmitting ? 'Updating Password...' : 'Save New Password & Sign In'}
					</button>
				</form>
			{/if}

			<div class="text-center text-xs text-black/60 pt-2">
				Remember your password?
				<a href="/login" class="text-black font-bold underline ml-1">Sign In</a>
			</div>
		</div>
	</div>

	<div class="p-6 text-center text-xs text-black/40 font-mono">
		© 2026 CognitiveOS • Built for serious learners
	</div>
</div>
