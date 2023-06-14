/** @typedef {import('../index.js').Feed} Feed */
/** @typedef {import('../index.js').Item} Item */
/** @typedef {import('../index.js').FeedImages} FeedImages */
import { decodeHTML } from 'entities'
import { Builder } from 'xml2js'
import { fields } from './fields.js'

/**
 * Strips HTML tags from a string
 * @param {String} str - The string to strip
 * @returns {String} The stripped string
 */
export function stripHtml(str) {
	str = str.replace(/([^\n])<\/?(h|br|p|ul|ol|li|blockquote|section|table|tr|div)(?:.|\n)*?>([^\n])/gm, '$1\n$3')
	str = str.replace(/<(?:.|\n)*?>/gm, '')
	return str
}

/**
 * Gets a snippet from a string
 * @param {String} str - The string to get a snippet from
 * @returns {String} The snippet
 */
export function getSnippet(str) {
	return decodeHTML(stripHtml(str)).trim()
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
		if (links[i].$.rel === rel)
			return links[i].$.href
	}

	if (links[fallbackIdx])
		return links[fallbackIdx].$.href
}

/**
 * Gets the content from an XML object
 * @param {Object} content - The XML object
 * @returns {String} The content
 */
export function getContent(content) {
	if (typeof content._ === 'string') {
		return content._
	}
	else if (typeof content === 'object') {
		const builder = new Builder({ headless: true, rootName: 'div', renderOpts: { pretty: false } })
		return builder.buildObject(content)
	}
	else {
		return content
	}
}

/**
 * Copies fields from an XML object to a destination object
 * @param {Object} xml - The XML object
 * @param {Object} dest - The destination object
 * @param {Array} fields - An array of fields to copy
 */
export function copyFromXML(xml, dest, fields) {
	fields.forEach((f) => {
		let from = f
		let to = f
		let options = {}
		if (Array.isArray(f)) {
			from = f[0]
			to = f[1]
			if (f.length > 2)
				options = f[2]
		}
		const { keepArray, includeSnippet } = options
		if (xml[from] !== undefined)
			dest[to] = keepArray ? xml[from] : xml[from][0]

		if (dest[to] && typeof dest[to]._ === 'string')
			dest[to] = dest[to]._

		if (includeSnippet && dest[to] && typeof dest[to] === 'string')
			dest[`${to}Snippet`] = getSnippet(dest[to])
	})
}

/**
 * Extracts an image from an item
 * @param {Object} item - The item to extract the image from
 * @returns {String} The image URL
 */
export function extractImageUrl(item) {
	if (item.image && typeof item.image === 'string')
		return item.image
	if (item.image && item.image.url)
		return item.image.url
	if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url)
		return item.thumbnail.$.url
	if (item.enclosure && item.enclosure.url)
		return item.enclosure.url
	if (item['media:thumbnail'] && item['media:thumbnail'].$ && item['media:thumbnail'].$.url)
		return item['media:thumbnail'].$.url
	if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url)
		return item['media:content'].$.url
	if (item['media:group'] && item['media:group']['media:thumbnail'] && item['media:group']['media:thumbnail'].$ && item['media:group']['media:thumbnail'].$.url)
		return item['media:group']['media:thumbnail'].$.url
	if (item['media:group'] && item['media:group']['media:content'] && item['media:group']['media:content'].$ && item['media:group']['media:content'].$.url)
		return item['media:group']['media:content'].$.url
	if (item['itunes:image'] && item['itunes:image'].$ && item['itunes:image'].$.href)
		return item['itunes:image'].$.href
	if (item['content:encoded']) {
		const imgSrcMatch = item['content:encoded'].match(/<img[^>]+src="([^">]+)"/i)
		if (imgSrcMatch && imgSrcMatch[1])
			return imgSrcMatch[1]
	}
	return null
}

/**
 * Decorates a feed with iTunes data
 * @param {Feed} feed - The feed to decorate
 * @param {Object} channel - The channel to get the iTunes data from
 * @returns {void}
 */
export function decorateItunes(feed, channel) {
	const items = channel.item || []
	// const categories = []
	feed.itunes = {}

	if (channel['itunes:owner']) {
		const owner = {}

		if (channel['itunes:owner'][0]['itunes:name'])
			owner.name = channel['itunes:owner'][0]['itunes:name'][0]

		if (channel['itunes:owner'][0]['itunes:email'])
			owner.email = channel['itunes:owner'][0]['itunes:email'][0]

		feed.itunes.owner = owner
	}

	if (channel['itunes:image']) {
		const hasImageHref = (channel['itunes:image'][0]
			&& channel['itunes:image'][0].$
			&& channel['itunes:image'][0].$.href)
		const image = hasImageHref ? channel['itunes:image'][0].$.href : null
		if (image)
			feed.itunes.image = image
	}

	if (channel['itunes:category']) {
		const categoriesWithSubs = channel['itunes:category'].map((category) => {
			return {
				name: category && category.$ && category.$.text,
				subs: category['itunes:category']
					? category['itunes:category']
						.map(subcategory => ({
							name: subcategory && subcategory.$ && subcategory.$.text,
						}))
					: null,
			}
		})

		feed.itunes.categories = categoriesWithSubs.map(category => category.name)
		feed.itunes.categoriesWithSubs = categoriesWithSubs
	}

	if (channel['itunes:keywords']) {
		if (channel['itunes:keywords'].length > 1) {
			feed.itunes.keywords = channel['itunes:keywords'].map(
				keyword => keyword && keyword.$ && keyword.$.text,
			)
		}
		else {
			let keywords = channel['itunes:keywords'][0]
			if (keywords && typeof keywords._ === 'string')
				keywords = keywords._

			if (keywords && keywords.$ && keywords.$.text)
				feed.itunes.keywords = keywords.$.text.split(',')
			else if (typeof keywords === 'string')
				feed.itunes.keywords = keywords.split(',')
		}
	}

	copyFromXML(channel, feed.itunes, fields.podcastFeed)
	items.forEach((item, index) => {
		const entry = feed.items[index]
		entry.itunes = {}
		copyFromXML(item, entry.itunes, fields.podcastItem)
		const image = item['itunes:image']
		if (image && image[0] && image[0].$ && image[0].$.href)
			entry.itunes.image = image[0].$.href
	})
}
