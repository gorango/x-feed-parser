import type { Options } from 'xml2js'

interface Enclosure {
	url: string
	length?: number
	type?: string
}

interface ITunes {
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

export interface Item {
	id?: string
	url?: string
	lang?: string
	title?: string
	summary?: string
	author?: string
	content?: string
	snippet?: string
	categories?: string[]
	keywords?: string[]
	commentsUrl?: string
	imageUrl?: string
	media?: Enclosure[]
	createdAt?: string
	updatedAt?: string
}

interface Meta {
	[key: string]: any
}

export interface Feed<U> {
	type?: 'rss' | 'atom' | 'json' | string
	title?: string
	description?: string
	imageUrl?: string
	siteUrl?: string
	feedUrl?: string
	items: (U & Item)[]
	itunes?: ITunes
	meta?: Meta
	etag?: string
	updatedAt?: string
}
