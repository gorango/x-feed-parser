import type { Options } from 'xml2js'

export interface Item {
	guid?: string
	url?: string
	imageUrl?: string
	title?: string
	date?: string
	summary?: string
	creator?: string
	content?: string
	snippet?: string
	categories?: string[]
}

export interface FeedImages {
	'image': any
	'enclosure': any
	'thumbnail': any
	'media:thumbnail': any
	'media:group': any
	'media:content': any
	'itunes:image': any
	'content:encoded': any
}

export interface Feed<U> {
	type?: 'rss' | 'atom' | 'json' | string
	title?: string
	description?: string
	imageUrl?: string,
	siteUrl?: string
	feedUrl?: string
	items: (U & Item)[]
	itunes?: {
		[key: string]: any
		image?: string
		owner?: {
			name?: string
			email?: string
		}
		author?: string
		summary?: string
		explicit?: string
		categories?: string[]
		keywords?: string[]
	}
}
