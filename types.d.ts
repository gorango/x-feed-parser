interface Enclosure {
	url: string
	length?: number
	type?: string
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
	type?: 'rss' | 'atom' | 'json' | 'html' | string
	lang?: string
	title?: string
	description?: string
	feedUrl?: string
	siteUrl?: string
	imageUrl?: string
	etag?: string
	updatedAt?: string
	items: (U & Item)[]
	meta?: Meta
}
