<script lang="ts">
import './layout.css';
import Broadcast from 'phosphor-svelte/lib/Broadcast';
import Gear from 'phosphor-svelte/lib/Gear';
import VideoCamera from 'phosphor-svelte/lib/VideoCamera';
import favicon from '$lib/assets/favicon.svg';

const { children } = $props();

const navItems = [
	{ label: 'Recordings', href: '/', icon: VideoCamera },
	{ label: 'Channels', href: '/channels', icon: Broadcast },
	{ label: 'Configuration', href: '/configuration', icon: Gear },
];
</script>

<svelte:head>
	<link rel="icon" href={favicon}>
	<title>TVOD - Twitch VOD Manager</title>
</svelte:head>

<div class="flex h-screen bg-zinc-950">
	<!-- Sidebar -->
	<aside class="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
		<div class="flex h-14 items-center border-b border-zinc-800 px-4">
			<h1 class="text-lg font-semibold text-white">TVOD</h1>
		</div>
		<nav class="flex-1 p-3">
			<ul class="space-y-1">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
						>
							<item.icon class="size-5" />
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>

	<!-- Main content -->
	<main class="flex flex-1 flex-col overflow-hidden">{@render children()}</main>
</div>
