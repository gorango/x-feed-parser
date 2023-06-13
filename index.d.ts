import type { Options } from 'xml2js'

type CustomFieldItem<U> = keyof U | (string | { keepArray: boolean })[]

export interface CustomFields<T, U> {
	feed?: Array<keyof T>
	item?: CustomFieldItem<U>[] | CustomFieldItem<U>[][]
}

export interface ParserOptions<T, U> {
	xml2js?: Options
	defaultRSS?: number
	customFields?: CustomFields<T, U>
}

export interface Enclosure {
	url: string
	length?: number
	type?: string
}

export interface Item {
	link?: string
	guid?: string
	title?: string
	pubDate?: string
	creator?: string
	summary?: string
	content?: string
	isoDate?: string
	categories?: string[]
	contentSnippet?: string
	enclosure?: Enclosure
}

export interface PaginationLinks {
	self?: string
	first?: string
	next?: string
	last?: string
	prev?: string
}

export interface Feed<U> {
	image?: {
		link?: string
		url: string
		title?: string
	},
	paginationLinks?: PaginationLinks
	link?: string
	title?: string
	items: (U & Item)[]
	feedUrl?: string
	description?: string
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
