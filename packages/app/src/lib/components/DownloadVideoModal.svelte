<script lang="ts">
	import { Dialog, Button } from 'bits-ui';
	import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
	import X from 'phosphor-svelte/lib/X';
	import { getBroadcastInfo, createBroadcastFromVideo } from '../../routes/api/broadcasts.remote';

	type Props = {
		open?: boolean;
	};

	let { open = $bindable(false) }: Props = $props();

	let url = $state('');
	let selectedQuality = $state('');
	let startTime = $state('');
	let endTime = $state('');
	let step = $state<'input' | 'info'>('input');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Derived state for the query - only created when we have a valid URL
	let videoInfo = $derived(step === 'info' && url ? getBroadcastInfo(url) : null);

	async function handleRetrieveInfo() {
		if (!url.trim()) return;
		isLoading = true;
		error = null;

		try {
			// Create the query and await it
			const info = await getBroadcastInfo(url);

			if (info) {
				step = 'info';
				// Select source quality by default
				const sourcePlaylist = info.playlists.find((p) => p.is_source);
				selectedQuality = sourcePlaylist?.name || info.playlists[0]?.name || '';
			}
		} catch (e) {
			error = 'Failed to retrieve video information. Please check the URL and try again.';
		} finally {
			isLoading = false;
		}
	}

	function handleClose() {
		open = false;
		// Reset state after close animation
		setTimeout(() => {
			url = '';
			selectedQuality = '';
			startTime = '';
			endTime = '';
			step = 'input';
			error = null;
		}, 200);
	}

	function handleBack() {
		step = 'input';
		error = null;
	}

	function formatDuration(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		if (hours > 0) {
			return `${hours}h ${minutes}m ${secs}s`;
		}
		return `${minutes}m ${secs}s`;
	}
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => !isOpen && handleClose()}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
		/>
		<Dialog.Content
			class="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
		>
			<div class="flex items-center justify-between">
				<Dialog.Title class="text-lg font-semibold text-white">Download Video</Dialog.Title>
				<Dialog.Close
					class="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
				>
					<X class="size-5" />
				</Dialog.Close>
			</div>

			<Dialog.Description class="mt-2 text-sm text-zinc-400">
				{#if step === 'input'}
					Enter a Twitch VOD URL to download.
				{:else}
					Review the video information and select quality.
				{/if}
			</Dialog.Description>

			<div class="mt-6">
				{#if step === 'input'}
					<div class="space-y-4">
						<div>
							<label for="video-url" class="block text-sm font-medium text-zinc-300">
								Video URL
							</label>
							<input
								id="video-url"
								type="url"
								bind:value={url}
								placeholder="https://www.twitch.tv/videos/..."
								class="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
							/>
						</div>

						{#if error}
							<p class="text-sm text-red-400">{error}</p>
						{/if}

						<Button.Root
							onclick={handleRetrieveInfo}
							disabled={!url.trim() || isLoading}
							class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isLoading}
								<CircleNotch class="size-4 animate-spin" />
								Retrieving...
							{:else}
								Retrieve video information
							{/if}
						</Button.Root>
					</div>
				{:else if videoInfo}
					{#await videoInfo}
						<div class="flex items-center justify-center py-8">
							<CircleNotch class="size-8 animate-spin text-zinc-400" />
						</div>
					{:then video}
						<div class="space-y-4">
							<div class="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
								<h3 class="font-medium text-white">{video.title}</h3>
								<div class="mt-2 space-y-1 text-sm text-zinc-400">
									<p>
										<span class="text-zinc-500">Channel:</span>
										{video.owner.displayName}
									</p>
									{#if video.game}
										<p>
											<span class="text-zinc-500">Game:</span>
											{video.game.name}
										</p>
									{/if}
									<p>
										<span class="text-zinc-500">Duration:</span>
										{formatDuration(video.lengthSeconds)}
									</p>
									<p>
										<span class="text-zinc-500">Views:</span>
										{video.viewCount.toLocaleString()}
									</p>
								</div>
							</div>

							<div>
								<label for="quality-select" class="block text-sm font-medium text-zinc-300">
									Quality
								</label>
								<select
									id="quality-select"
									bind:value={selectedQuality}
									class="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
								>
									{#each video.playlists as playlist}
										<option value={playlist.name}>
											{playlist.name}
											{#if playlist.resolution}
												({playlist.resolution})
											{/if}
											{#if playlist.is_source}
												- Source
											{/if}
										</option>
									{/each}
								</select>
							</div>

							<div class="grid grid-cols-2 gap-3">
								<div>
									<label for="start-time" class="block text-sm font-medium text-zinc-300">
										Start time
									</label>
									<input
										id="start-time"
										type="text"
										bind:value={startTime}
										placeholder="00:00:00"
										class="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
									/>
									<p class="mt-1 text-xs text-zinc-500">Format: HH:MM:SS</p>
								</div>
								<div>
									<label for="end-time" class="block text-sm font-medium text-zinc-300">
										End time
									</label>
									<input
										id="end-time"
										type="text"
										bind:value={endTime}
										placeholder={formatDuration(video.lengthSeconds).replace(/\s/g, ':')}
										class="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
									/>
									<p class="mt-1 text-xs text-zinc-500">Leave empty for full video</p>
								</div>
							</div>

							<div class="flex gap-3">
								<Button.Root
									onclick={handleBack}
									class="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
								>
									Back
								</Button.Root>
								<form {...createBroadcastFromVideo} class="flex-1">
									<input type="hidden" name="url" value={url} />
									<input type="hidden" name="quality" value={selectedQuality} />
									<input type="hidden" name="startTime" value={startTime} />
									<input type="hidden" name="endTime" value={endTime} />
									<Button.Root
										type="submit"
										class="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
									>
										Download
									</Button.Root>
								</form>
							</div>
						</div>
					{:catch}
						<div class="space-y-4">
							<p class="text-sm text-red-400">
								Failed to load video information. Please try again.
							</p>
							<Button.Root
								onclick={handleBack}
								class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
							>
								Back
							</Button.Root>
						</div>
					{/await}
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
