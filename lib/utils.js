/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */
import { XMLParser } from 'fast-xml-parser'
import { fields } from './fields.js'
import { sanitizeHtml } from './html.js'

export function parseXml(str) {
	return new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '',
	}).parse(str)
}

/**
 * Gets a link from a list of links
 * @param {Array} links - The list of links
 * @param {String} rel - The rel to get
 * @param {Number} fallbackIdx - The index to fallback to if the rel is not found
 * @returns {String} The link
 */
export function getLink(links, rel, fallbackIdx) {
	if (!links)
		return
	for (let i = 0; i < links.length; ++i) {
		if (links[i].rel === rel)
			return links[i].href
	}

	if (links[fallbackIdx])
		return links[fallbackIdx].href
}

/**
 * Gets the content from an XML object
 * @param {Object | String} content - The XML object
 * @returns {any} The content
 */
export function getContent(content) {
	const html = typeof content._ === 'string'
		? content._
		: content
	return sanitizeHtml(html).value
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
		let from = field
		let to = field
		// let options = {}
		if (Array.isArray(field)) {
			from = field[0]
			to = field[1]
			// if (field.length > 2)
			// 	options = field[2]
		}
		// const { keepArray, includeSnippet } = options
		if (xml[from] !== undefined)
			dest[to] = xml[from]

		if (dest[to] && typeof dest[to]._ === 'string')
			dest[to] = dest[to]._
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
		return category.map(cat => getCategories(cat)).flat().filter(Boolean)

	if (typeof category === 'string') {
		if (category.includes(','))
			return category.split(',')
		else
			return [category]
	}

	if (typeof category === 'object')
		return [category.term || category['#text']]
}

export function getMeta(xml) {
	const entry = copyFromXml(xml, fields.meta)
	const meta = {}
	const { group, ...rest } = entry
	if (group) {
		// youtube
		const community = group['media:community']
		if (community) {
			meta.rating = community['media:starRating']
			meta.statistics = community['media:statistics']
		}
	}
	Object.assign(meta, rest)
	return meta
}
