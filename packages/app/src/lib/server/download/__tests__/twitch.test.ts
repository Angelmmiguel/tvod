import { describe, it, expect } from 'vitest';
import { getVideoInfo, getChannelVideos, downloadVideo } from '../twitch';

describe('twitch-dl wrapper', () => {
	it('getVideoInfo returns validated video info', async () => {
		const info = await getVideoInfo('2602012097');

		expect(info.id).toBe('2602012097');
		expect(info.title).toBeTruthy();
		expect(info.owner.login).toBe('baitybait');
		expect(info.playlists).toBeInstanceOf(Array);
		expect(info.playlists.length).toBeGreaterThan(0);

		// Check that we have the expected quality options
		const qualityNames = info.playlists.map((p) => p.name);
		expect(qualityNames).toContain('160p');
	}, 30000);

	it('getVideoInfo accepts full URL', async () => {
		const info = await getVideoInfo('https://www.twitch.tv/videos/2602012097');

		expect(info.id).toBe('2602012097');
	}, 30000);

	it('getChannelVideos returns validated videos list', async () => {
		const response = await getChannelVideos('baitybait', { limit: 2 });

		expect(response.count).toBe(2);
		expect(response.totalCount).toBeGreaterThan(0);
		expect(response.videos).toBeInstanceOf(Array);
		expect(response.videos.length).toBe(2);

		const video = response.videos[0];
		expect(video.id).toBeTruthy();
		expect(video.title).toBeTruthy();
		expect(video.owner.login).toBe('baitybait');
	}, 30000);

	it('downloadVideo downloads a short clip at 160p', async () => {
		const result = await downloadVideo('2602012097', {
			quality: '160p',
			start: 0,
			end: 10,
			overwrite: true,
			concat: true, // Use concat to avoid ffmpeg dependency
		});

		expect(result.success).toBe(true);
		expect(result.output).toBeTruthy();
		expect(result.filePath).toMatch(/\.ts$/);
	}, 120000);
});
