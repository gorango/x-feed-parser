export interface Feed {
	type?: string
	lang?: string
	title?: string
	description?: string
	feedUrl?: string
	siteUrl?: string
	imageUrl?: string
	etag?: string
	updatedAt?: string
	items: Item[]
}

export interface Item {
	id?: string
	url?: string
	lang?: string
	title?: string
	author?: string
	content?: string
	snippet?: string
	summary?: string
	categories?: string[]
	commentsUrl?: string
	imageUrl?: string
	createdAt?: string
	updatedAt?: string
	media?: Enclosure[]
	meta?: Meta
}

interface Enclosure {
	url: string
	length?: number
	type?: string
}

interface Meta {
	[key: string]: any
}
