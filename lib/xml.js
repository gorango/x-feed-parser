/** @typedef {import('./types.js').Feed} Feed */
/** @typedef {import('./types.js').Item} Item */
import { decodeXML } from 'entities'
import { copyFromXml, fields, getCategories, getContent, getImageUrl, getMeta, parseXml } from './utils.js'
import { getSnippet } from './html.js'

/**
 * parse Xml feed
 * @param {String} str
 * @returns {Feed} feed
 */
export function parseXmlFeed(str) {
	const xml = parseXml(str)
	const isAtom = Boolean(xml?.feed)
	const isRss2 = Boolean(xml?.rss?.version?.match(/^2/))
	const isRss1 = Boolean(xml['rdf:RDF'])
	const isRss0 = Boolean(xml?.rss?.version?.match(/0\.9/))

	if (!isAtom && !isRss2 && !isRss1 && !isRss0)
		return null

	let lang
	const feed = {}
	const root = isAtom ? xml.feed : isRss1 ? xml['rdf:RDF']?.channel : xml.rss.channel
	const channel = copyFromXml(root, fields.feed)
	const entries = isAtom ? root.entry : isRss1 ? xml['rdf:RDF']?.item : root.item
	const items = !Array.isArray(entries) ? [entries] : entries

	feed.type = isAtom ? 'atom' : 'rss'

	if (channel.lang)
		feed.lang = lang = channel.lang.trim()

	if (channel.title) {
		if (typeof channel.title === 'object')
			feed.title = decodeXML(channel.title['#text'])?.trim()
		else
			feed.title = decodeXML(channel.title)?.trim()
	}

	if (channel.description)
		feed.description = decodeXML(channel.description)?.trim()

	if (channel.link) {
		if (Array.isArray(channel.link)) {
			feed.feedUrl = channel.link.find(link => link.rel === 'self')?.href
			feed.siteUrl = channel.link.find(link => link.rel === 'alternate')?.href
		}
		else if (typeof channel.link === 'string') {
			feed.siteUrl = channel.link
		}
		else if (typeof channel.link === 'object') {
			if (channel.link.rel === 'self')
				feed.feedUrl = channel.link.href
			if (channel.link.rel === 'alternate')
				feed.siteUrl = channel.link.href
		}
	}

	if (channel.source)
		feed.feedUrl = channel.source

	if (channel.image) {
		if (typeof channel.image === 'string')
			feed.imageUrl = channel.image
		else if (typeof channel.image === 'object')
			feed.imageUrl = channel.image.url
	}

	if (channel.etag)
		feed.etag = channel.etag

	if (channel.updatedAt)
		feed.updatedAt = new Date(channel.updatedAt).toISOString()

	feed.items = (items || [])?.map(item => parseItem(item, lang))

	return feed
}

/**
 * parse Rss item from XML object
 * @param {Object} xmlItem
 * @param {String} lang
 * @returns {Item} item
 */
function parseItem(xmlItem, lang = 'en') {
	if (!xmlItem)
		return null

	const item = {}
	const entry = copyFromXml(xmlItem, fields.item)

	if (entry.id) {
		if (typeof entry.id === 'object')
			item.id = entry.id['#text']
			// if (entry.id?.isPermaLink !== 'false')
			// 	item.url = entry.id['#text']

		if (typeof entry.id === 'string')
			item.id = entry.id
	}

	if (entry.url && !item.url) {
		if (Array.isArray(entry.url))
			item.url = entry.url.find(link => link?.rel === 'self')?.href
		else if (typeof entry.url === 'object')
			item.url = entry.url.href
		else if (typeof entry.url === 'string')
			item.url = entry.url
	}

	if (entry.lang)
		item.lang = entry.lang?.trim() || lang

	if (entry.title) {
		if (typeof entry.title === 'object')
			item.title = decodeXML(entry.title['#text'])?.trim()
		else
			item.title = decodeXML(entry.title)?.trim()
	}

	if (entry.author) {
		if (Array.isArray(entry.author))
			item.author = decodeXML(entry.author[0]?.name)?.trim()
		else if (typeof entry.author === 'object')
			item.author = decodeXML(entry.author.name || entry.author['#text'])?.trim()
		else if (typeof entry.author === 'string')
			item.author = decodeXML(entry.author)?.trim()
	}

	if (entry.description) {
		if (typeof entry.description === 'string')
			item.content = getContent(decodeXML(entry.description))
		else if (typeof entry.description === 'object' && entry.description['#text'])
			item.content = getContent(decodeXML(entry.description['#text']))
	}

	if (entry.content) {
		if (typeof entry.content === 'string')
			item.content = getContent(decodeXML(entry.content))
		else if (typeof entry.content === 'object')
			item.content = getContent(decodeXML(entry.content['#text']))
	}

	if (xmlItem?.['media:group'] && xmlItem['media:group']['media:description'])
		item.content = decodeXML(xmlItem['media:group']['media:description'])?.trim()

	if (item.content)
		item.snippet = getSnippet(item.content)

	if (entry.summary) {
		if (typeof entry.summary === 'object')
			item.summary = decodeXML(entry.summary['#text'])?.trim()
		else
			item.summary = decodeXML(entry.summary)?.trim()
	}

	if (entry.category)
		item.categories = getCategories(entry.category)

	if (entry.comments) {
		if (typeof entry.comments === 'string')
			item.commentsUrl = entry.comments
	}

	const imageUrl = getImageUrl(xmlItem)
	if (imageUrl)
		item.imageUrl = imageUrl

	if (entry.createdAt)
		item.createdAt = new Date(entry.createdAt).toISOString()

	if (entry.updatedAt)
		item.updatedAt = new Date(entry.updatedAt).toISOString()

	if (
		Object.keys(xmlItem)?.find(key =>
			key.startsWith('itunes:') || key === 'media:group')
	)
		item.meta = getMeta(xmlItem)

	if (entry.enclosure)
		item.media = Array.isArray(entry.enclosure) ? entry.enclosure : [entry.enclosure]

	if (xmlItem?.['media:group'] && xmlItem['media:group']['media:content'])
		item.media = [xmlItem['media:group']['media:content']]

	return item
}
