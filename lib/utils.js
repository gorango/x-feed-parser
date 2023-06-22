/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */
import { fields } from './fields.js'
import { getSnippet, sanitizeHtml } from './html.js'

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
		if (links[i].$.rel === rel)
			return links[i].$.href
	}

	if (links[fallbackIdx])
		return links[fallbackIdx].$.href
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
export function copyFromXML(xml, fields) {
	const dest = {}
	fields.forEach((field) => {
		let from = field
		let to = field
		let options = {}
		if (Array.isArray(field)) {
			from = field[0]
			to = field[1]
			if (field.length > 2)
				options = field[2]
		}
		const { keepArray, includeSnippet } = options
		if (xml[from] !== undefined)
			dest[to] = keepArray ? xml[from] : xml[from][0]

		if (dest[to] && typeof dest[to]._ === 'string')
			dest[to] = dest[to]._

		if (includeSnippet && dest[to] && typeof dest[to] === 'string')
			dest[`${to}Snippet`] = getSnippet(dest[to])
	})
	return dest
}

/**
 * Extracts an image from an item
 * @param {Object} xmlItem - The item to extract the image from
 * @returns {String} The image URL
 */
export function getImageUrl(xmlItem) {
	const item = copyFromXML(xmlItem, fields.image)
	if (item.image) {
		if (typeof item.image === 'string')
			return item.image
		if (item.image.url)
			return item.image.url
	}
	if (item['media:thumbnail']?.$?.url)
		return item['media:thumbnail'].$.url
	if (item['media:content']?.$?.url && item['media:content'].$.type?.startsWith('image'))
		return item['media:content'].$.url
	if (item['media:group']) {
		if (item['media:group']['media:thumbnail']?.[0]?.$?.url)
			return item['media:group']['media:thumbnail'][0].$.url
		if (item['media:group']['media:content']?.[0]?.$?.url && item['media:group']['media:content'][0].$.type?.startsWith('image'))
			return item['media:group']['media:content'][0].$.url
	}
	if (item['itunes:image']?.$?.href)
		return item['itunes:image'].$.href
	if (item.content) {
		const imgSrcMatch = item.content.match(/<img[^>]+src="([^">]+)"/i)
		if (imgSrcMatch && imgSrcMatch[1])
			return imgSrcMatch[1]
	}
	if (item.enclosure?.[0]?.$?.url && item.enclosure[0]?.$?.type.startsWith('image'))
		return item.enclosure.$.url

	return null
}
