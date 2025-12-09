import { spawn } from 'node:child_process';
import * as v from 'valibot';

// =============================================================================
// Valibot Schemas
// =============================================================================

const GameSchema = v.object({
	id: v.string(),
	name: v.string(),
});

const UserSchema = v.object({
	id: v.string(),
	login: v.string(),
	displayName: v.string(),
});

const PlaylistSchema = v.object({
	name: v.string(),
	group_id: v.string(),
	resolution: v.nullable(v.string()),
	url: v.string(),
	is_source: v.boolean(),
});

const ChapterSchema = v.object({
	id: v.string(),
	durationMilliseconds: v.number(),
	positionMilliseconds: v.number(),
	type: v.string(),
	description: v.string(),
	subDescription: v.string(),
	thumbnailURL: v.nullable(v.string()),
	game: v.nullable(GameSchema),
});

export const VideoInfoSchema = v.object({
	id: v.string(),
	title: v.string(),
	description: v.nullable(v.string()),
	createdAt: v.string(),
	recordedAt: v.string(),
	publishedAt: v.string(),
	updatedAt: v.string(),
	broadcastType: v.string(),
	lengthSeconds: v.number(),
	status: v.string(),
	viewCount: v.number(),
	seekPreviewsURL: v.nullable(v.string()),
	game: v.nullable(GameSchema),
	owner: UserSchema,
	creator: UserSchema,
	playlists: v.array(PlaylistSchema),
	chapters: v.array(ChapterSchema),
});

export type VideoInfo = v.InferOutput<typeof VideoInfoSchema>;
export type Playlist = v.InferOutput<typeof PlaylistSchema>;

const VideoSummarySchema = v.object({
	id: v.string(),
	title: v.string(),
	description: v.nullable(v.string()),
	createdAt: v.string(),
	recordedAt: v.string(),
	publishedAt: v.string(),
	updatedAt: v.string(),
	broadcastType: v.string(),
	lengthSeconds: v.number(),
	status: v.string(),
	viewCount: v.number(),
	seekPreviewsURL: v.nullable(v.string()),
	game: v.nullable(GameSchema),
	owner: UserSchema,
	creator: UserSchema,
});

export const VideosResponseSchema = v.object({
	count: v.number(),
	totalCount: v.number(),
	videos: v.array(VideoSummarySchema),
});

export type VideosResponse = v.InferOutput<typeof VideosResponseSchema>;
export type VideoSummary = v.InferOutput<typeof VideoSummarySchema>;

// =============================================================================
// Error Classes
// =============================================================================

export class TwitchDlError extends Error {
	constructor(
		message: string,
		public readonly code: number,
		public readonly stderr: string
	) {
		super(message);
		this.name = 'TwitchDlError';
	}
}

export class TwitchDlValidationError extends Error {
	constructor(
		message: string,
		public readonly issues: v.BaseIssue<unknown>[]
	) {
		super(message);
		this.name = 'TwitchDlValidationError';
	}
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Execute a twitch-dl command and return the output
 */
async function execTwitchDl(args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const uvxPath = process.env.UVX_PATH ?? 'uvx';
		const proc = spawn(uvxPath, ['twitch-dl', ...args], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		let stdout = '';
		let stderr = '';

		proc.stdout.on('data', (data) => {
			stdout += data.toString();
		});

		proc.stderr.on('data', (data) => {
			stderr += data.toString();
		});

		proc.on('close', (code) => {
			if (code === 0) {
				resolve(stdout);
			} else {
				reject(new TwitchDlError(`twitch-dl exited with code ${code}`, code ?? 1, stderr));
			}
		});

		proc.on('error', (err) => {
			reject(new TwitchDlError(`Failed to spawn twitch-dl: ${err.message}`, -1, ''));
		});
	});
}

/**
 * Convert seconds to hh:mm:ss format required by twitch-dl
 */
function formatTime(time: string | number): string {
	// If already a string in time format, return as-is
	if (typeof time === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
		return time;
	}

	// Convert number of seconds to hh:mm:ss
	const totalSeconds = typeof time === 'string' ? parseInt(time, 10) : time;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Extract video ID from a Twitch URL or return the ID if already provided
 */
function parseVideoId(videoIdOrUrl: string): string {
	// If it's a URL, extract the video ID
	const urlMatch = videoIdOrUrl.match(/twitch\.tv\/videos\/(\d+)/);
	if (urlMatch) {
		return urlMatch[1];
	}

	// If it looks like just digits, return as-is
	if (/^\d+$/.test(videoIdOrUrl)) {
		return videoIdOrUrl;
	}

	throw new Error(`Invalid video ID or URL: ${videoIdOrUrl}`);
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Get detailed information about a Twitch video including available playlists
 */
export async function getVideoInfo(videoIdOrUrl: string): Promise<VideoInfo> {
	const videoId = parseVideoId(videoIdOrUrl);
	const output = await execTwitchDl(['info', videoId, '--json']);

	// Find the JSON in the output (skip any status messages)
	// Trim whitespace and look for the outermost JSON object
	const trimmed = output.trim();
	const jsonStart = trimmed.indexOf('{');
	const jsonEnd = trimmed.lastIndexOf('}');
	if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
		throw new TwitchDlError('No JSON output found in twitch-dl response', 0, output);
	}

	const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
	const result = v.safeParse(VideoInfoSchema, parsed);

	if (!result.success) {
		throw new TwitchDlValidationError(
			'Failed to validate video info response',
			result.issues
		);
	}

	return result.output;
}

export interface GetChannelVideosOptions {
	/** Maximum number of videos to return */
	limit?: number;
	/** Filter by video type: archive, highlight, upload */
	type?: 'archive' | 'highlight' | 'upload';
	/** Filter by game ID */
	gameId?: string;
}

/**
 * Get a list of videos from a Twitch channel
 */
export async function getChannelVideos(
	channel: string,
	options: GetChannelVideosOptions = {}
): Promise<VideosResponse> {
	const args = ['videos', channel, '--json'];

	if (options.limit !== undefined) {
		args.push('--limit', String(options.limit));
	}

	if (options.type) {
		args.push('--type', options.type);
	}

	if (options.gameId) {
		args.push('--game', options.gameId);
	}

	const output = await execTwitchDl(args);

	// Find the JSON in the output (skip any status messages)
	// Trim whitespace and look for the outermost JSON object
	const trimmed = output.trim();
	const jsonStart = trimmed.indexOf('{');
	const jsonEnd = trimmed.lastIndexOf('}');
	if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
		throw new TwitchDlError('No JSON output found in twitch-dl response', 0, output);
	}

	const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
	const result = v.safeParse(VideosResponseSchema, parsed);

	if (!result.success) {
		throw new TwitchDlValidationError(
			'Failed to validate videos response',
			result.issues
		);
	}

	return result.output;
}

export interface DownloadVideoOptions {
	/** Video quality (e.g., "1080p60", "720p60", "480p", "160p", "audio_only") */
	quality: string;
	/** Output file path (optional, twitch-dl will generate a default name) */
	output?: string;
	/** Start time in seconds (number) or hh:mm:ss format (string) */
	start?: string | number;
	/** End time in seconds (number) or hh:mm:ss format (string) */
	end?: string | number;
	/** Overwrite existing files */
	overwrite?: boolean;
	/** Use concat instead of ffmpeg for joining (produces .ts file, no ffmpeg required) */
	concat?: boolean;
}

export interface DownloadResult {
	success: boolean;
	output: string;
	filePath?: string;
}

/**
 * Download a Twitch video
 */
export async function downloadVideo(
	videoIdOrUrl: string,
	options: DownloadVideoOptions
): Promise<DownloadResult> {
	const videoId = parseVideoId(videoIdOrUrl);
	const args = ['download', videoId, '--quality', options.quality];

	if (options.output) {
		args.push('--output', options.output);
	}

	if (options.start !== undefined) {
		args.push('--start', formatTime(options.start));
	}

	if (options.end !== undefined) {
		args.push('--end', formatTime(options.end));
	}

	if (options.overwrite) {
		args.push('--overwrite');
	}

	if (options.concat) {
		args.push('--concat');
	}

	const output = await execTwitchDl(args);

	// Try to extract the output file path from the output
	const fileMatch = output.match(/Downloaded:\s*(.+\.(?:mp4|mkv|ts))/i);
	const filePath = fileMatch?.[1]?.trim();

	return {
		success: true,
		output,
		filePath,
	};
}
