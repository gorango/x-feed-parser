/** @typedef {import('../types.js').Feed} Feed */
/** @typedef {import('../types.js').Item} Item */
import { XMLParser } from 'fast-xml-parser'
import { sanitizeHtml } from './html.js'

export const fields = {
	feed: [
		'title',
		'description',
		'link',
		'atom:link',
		['language', 'lang'],
		'copyright',
		'id',
		'etag',
		'image',
		['date', 'updatedAt'],
		['updated', 'updatedAt'],
		['lastBuildDate', 'updatedAt'],
		['dc:title', 'title'],
		['dc:description', 'description'],
		['dc:source', 'source'],
		['dc:date', 'updatedAt'],
		['dc:language', 'lang'],
		['dc:rights', 'copyright'],
		['syn:updateBase', 'updatedAt'],
	],
	item: [
		'id',
		['guid', 'id'],
		['link', 'url'],
		'title',
		'author',
		'description',
		'category',
		['date', 'createdAt'],
		['published', 'createdAt'],
		['pubDate', 'createdAt'],
		['updated', 'updatedAt'],
		['dc:title', 'title'],
		['dc:creator', 'author'],
		['dc:subject', 'category'],
		['dc:description', 'description'],
		['dc:source', 'source'],
		['dc:date', 'updatedAt'],
		['dc:language', 'lang'],
		'summary',
		'content',
		['content:encoded', 'content'],
		'comments',
		['enclosure', 'enclosure'],
		['enc:enclosure', 'enclosure'],
		['itunes:author', 'author'],
		['itunes:category', 'category'],
		['itunes:summary', 'description'],
		['media:group', 'group'],
	],
	image: [
		'image',
		['itunes:image', 'image'],
		'media:thumbnail',
		'media:content',
		'media:group',
		['enclosure', 'enclosure'],
		['enc:enclosure', 'enclosure'],
		['description', 'content'],
		['dc:description', 'content'],
		'content',
		['content:encoded', 'content'],
	],
	meta: [
		['itunes:duration', 'duration'],
		['itunes:explicit', 'explicit'],
		['itunes:subtitle', 'subtitle'],
		['itunes:season', 'season'],
		['itunes:episode', 'episode'],
		['itunes:episodeType', 'episodeType'],
		['itunes:keywords', 'keywords'],
		['media:group', 'group'],
	],
}

export function parseXml(str) {
	return new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '',
	}).parse(str)
}

/**
 * Gets the content from an XML object
 * @param {Object | String} content - The XML object
 * @returns {String} The sanitized HTML content
 */
export function getContent(content) {
	return sanitizeHtml(content).value
}

/**
 * Copies fields from an XML object to a destination object
 * @param {Object} xml - The XML object
 * @param {Array} fields - An array of fields to copy
 * @returns {Object} The destination object
 */
export function copyFromXml(xml, fields) {
	const dest = {}
	if (!xml)
		return dest
	fields.forEach((field) => {
		const isArray = Array.isArray(field)
		const from = isArray ? field[0] : field
		const to = isArray ? field[1] : field
		if (xml[from] !== undefined)
			dest[to] = xml[from]
	})
	return dest
}

/**
 * Extracts an image from an item
 * @param {Object} xmlItem - The item to extract the image from
 * @returns {String} The image URL
 */
export function getImageUrl(xmlItem) {
	const item = copyFromXml(xmlItem, fields.image)

	if (item.image) {
		if (typeof item.image === 'string')
			return item.image
		if (item.image.url)
			return item.image.url
		if (item.image.href)
			return item.image.href
	}

	if (item['media:thumbnail']?.url)
		return item['media:thumbnail'].url

	if (
		item['media:content']?.url
		&& item['media:content'].type?.startsWith('image')
	)
		return item['media:content'].url

	if (item['media:group']) {
		if (item['media:group']['media:thumbnail'].url)
			return item['media:group']['media:thumbnail'].url
		if (
			item['media:group']['media:content'].url
			&& item['media:group']['media:content'].type?.startsWith('image')
		)
			return item['media:group']['media:content'].url
	}

	if (item.enclosure && item.enclosure.type.startsWith('image'))
		return item.enclosure.url || item.enclosure.resource

	if (item.content) {
		if (Array.isArray(item.content))
			item.content = item.content[0]

		if (typeof item.content === 'object')
			item.content = item.content['#text']

		const imgSrcMatch = item.content.match(/<img[^>]+src="([^">]+)"/i)
		if (imgSrcMatch?.[1])
			return imgSrcMatch[1]
	}

	return null
}

export function getCategories(category) {
	if (Array.isArray(category))
		return category.map(c => getCategories(c)).flat().filter(Boolean)

	if (typeof category === 'string') {
		if (category.includes(','))
			return category.split(',').map(c => c.trim())
		else
			return [category]
	}

	if (typeof category === 'object')
		return [(category.term || category['#text'])?.trim()]
}

export function getMeta(xml) {
	const entry = copyFromXml(xml, fields.meta)
	const meta = {}
	const { group, ...rest } = entry
	Object.assign(meta, rest)

	if (group) { // youtube
		const community = group['media:community']
		if (community) {
			meta.rating = community['media:starRating']
			meta.statistics = community['media:statistics']
		}
	}

	return meta
}
