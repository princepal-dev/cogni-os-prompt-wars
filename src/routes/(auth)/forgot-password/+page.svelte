<script lang="ts">
	let email = $state('');
	let isSubmitting = $state(false);
	let message = $state<string | null>(null);
	let devToken = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	async function handleForgot() {
		if (!email.trim() || !email.includes('@')) {
			errorMessage = 'Please enter a valid email address';
			return;
		}
		isSubmitting = true;
		errorMessage = null;
		message = null;
		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			const json = await res.json();
			if (json.success) {
				message = json.data.message;
				if (json.data.devResetToken) {
					devToken = json.data.devResetToken;
				}
			} else {
				errorMessage = json.error?.message || 'Request failed';
			}
		} catch (e: any) {
			errorMessage = e.message;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password — CognitiveOS</title>
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
			Back to sign in →
		</a>
	</div>

	<div class="flex-1 flex items-center justify-center p-4">
		<div class="w-full max-w-md bg-white rounded-3xl p-8 border border-[#e6e6e6] shadow-xl space-y-6">
			<div class="text-center space-y-1">
				<div class="w-12 h-12 rounded-2xl bg-[#c5b0f4] flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
					🔑
				</div>
				<h1 class="text-2xl font-bold text-black font-display">Reset Your Password</h1>
				<p class="text-xs text-black/60 font-light">Enter your email and we will send a password reset link.</p>
			</div>

			{#if message}
				<div class="p-4 rounded-xl bg-[#c8e6cd] border border-[#1ea64a]/30 text-xs text-green-900 space-y-2">
					<p class="font-medium">{message}</p>
					{#if devToken}
						<div class="pt-2 border-t border-green-800/20">
							<span class="text-[11px] font-mono text-green-800 block">Evaluator Direct Link:</span>
							<a
								href={`/reset-password?token=${devToken}`}
								class="text-xs font-mono font-bold underline text-green-950 block mt-1 break-all"
							>
								Proceed to Reset Password →
							</a>
						</div>
					{/if}
				</div>
			{/if}

			{#if errorMessage}
				<div class="p-3 rounded-xl bg-[#efd4d4] border border-red-300 text-xs text-red-900 font-medium">
					{errorMessage}
				</div>
			{/if}

			{#if !message}
				<form onsubmit={(e) => { e.preventDefault(); handleForgot(); }} class="space-y-4 text-left">
					<div>
						<label for="forgot-email" class="block text-xs font-bold text-black/80 mb-1 uppercase tracking-wider font-mono">
							Account Email Address:
						</label>
						<input
							id="forgot-email"
							type="email"
							bind:value={email}
							required
							placeholder="name@example.com"
							class="w-full bg-[#f7f7f5] rounded-xl px-3.5 py-2.5 text-xs text-black border border-[#e6e6e6] focus:outline-none focus:border-black font-medium"
						/>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="btn-primary-pill w-full py-3 text-xs justify-center"
					>
						{isSubmitting ? 'Submitting...' : 'Send Reset Link'}
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
