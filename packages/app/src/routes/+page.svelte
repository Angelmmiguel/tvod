<script lang="ts">
  import { Button } from 'bits-ui';
  import CircleNotch from 'phosphor-svelte/lib/CircleNotch';
  import DownloadSimple from 'phosphor-svelte/lib/DownloadSimple';
  import FilmReel from 'phosphor-svelte/lib/FilmReel';
  import UserPlus from 'phosphor-svelte/lib/UserPlus';
  import DownloadVideoModal from '$lib/components/DownloadVideoModal.svelte';
  import { getBroadcasts } from './api/broadcasts.remote';

  const query = getBroadcasts();
  let downloadModalOpen = $state(false);
</script>

<div class="flex flex-1 flex-col items-center justify-center p-8">
  {#if query.error}
    <p class="text-zinc-400">oops!</p>
  {:else if query.loading || !query.ready}
    <CircleNotch class="size-8 animate-spin text-zinc-400" />
  {:else}
    {#if query.current && query.current.length > 0} 
      <ul>
        {#each query.current as { title }}
          <li class="text-zinc-400">{title}</li>
        {/each}
      </ul>
    {:else}
      <div class="flex flex-col items-center gap-6 text-center">
        <div class="flex size-20 items-center justify-center rounded-full bg-zinc-800">
          <FilmReel class="size-10 text-zinc-500"/>
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-semibold text-white">No recordings yet</h2>
          <p class="max-w-md text-sm text-zinc-400">
            Download VODs from your favorite Twitch channels
          </p>
        </div>

        <div class="flex gap-3">
          <Button.Root
            onclick={() => downloadModalOpen = true}
            class="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 active:scale-[0.98]"
          >
            <DownloadSimple class="size-4"/>
            Download a video
          </Button.Root>
        </div>
      </div>
    {/if}
  {/if}
</div>

<DownloadVideoModal bind:open={downloadModalOpen} />
