/** @typedef {import('../types').ParserOptions} ParserOptions */
/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').PaginationLinks} PaginationLinks */
/** @typedef {import('../types').Item} Item */
import { fields } from './fields.js'
import { copyFromXML, getContent, getSnippet, setISODate } from './utils.js'

/**
 * parse RSS v0.9
 * @param {Object} xmlObj
 * @param {ParserOptions} options
 * @returns {Feed} feed
 */
export function buildRSS0_9(xmlObj, options) {
	const channel = xmlObj.rss.channel[0]
	const items = channel.item
	return buildRSS(channel, items, options)
}

/**
 * parse RSS v1
 * @param {Object} xmlObj
 * @param {ParserOptions} options
 * @returns {Feed} feed
 */
export function buildRSS1(xmlObj, options) {
	xmlObj = xmlObj['rdf:RDF']
	const channel = xmlObj.channel[0]
	const items = xmlObj.item
	return buildRSS(channel, items, options)
}

/**
 * parse RSS v2
 * @param {Object} xmlObj
 * @param {ParserOptions} options
 * @returns {Feed} feed
 */
export function buildRSS2(xmlObj, options) {
	const channel = xmlObj.rss.channel[0]
	const items = channel.item
	const feed = buildRSS(channel, items, options)
	if (xmlObj.rss.$ && xmlObj.rss.$['xmlns:itunes'])
		decorateItunes(feed, channel)

	return feed
}

/**
 * Build RSS
 * @param {Object} channel
 * @param {Object[]} items
 * @param {ParserOptions} options
 * @returns {Feed} feed
 */
function buildRSS(channel, items, options) {
	items = items || []
	const feed = { items: [] }
	const feedFields = [...fields.feed, ...options.customFields.feed]
	const itemFields = [...fields.item, ...options.customFields.item]
	if (channel['atom:link'] && channel['atom:link'][0] && channel['atom:link'][0].$)
		feed.feedUrl = channel['atom:link'][0].$.href

	if (channel.image && channel.image[0] && channel.image[0].url) {
		feed.image = {}
		const image = channel.image[0]
		if (image.link)
			feed.image.link = image.link[0]
		if (image.url)
			feed.image.url = image.url[0]
		if (image.title)
			feed.image.title = image.title[0]
		if (image.width)
			feed.image.width = image.width[0]
		if (image.height)
			feed.image.height = image.height[0]
	}
	const paginationLinks = generatePaginationLinks(channel)
	if (Object.keys(paginationLinks).length)
		feed.paginationLinks = paginationLinks

	copyFromXML(channel, feed, feedFields)
	feed.items = items.map(xmlItem => parseItemRss(xmlItem, itemFields))
	return feed
}

/**
 * parse RSS item from XML object
 * @param {Object} xmlItem
 * @param {Object[]} itemFields
 * @returns {Item} item
 */
function parseItemRss(xmlItem, itemFields) {
	const item = {}
	copyFromXML(xmlItem, item, itemFields)
	if (xmlItem.enclosure)
		item.enclosure = xmlItem.enclosure[0].$

	if (xmlItem.description) {
		item.content = getContent(xmlItem.description[0])
		item.contentSnippet = getSnippet(item.content)
	}
	if (xmlItem.guid) {
		item.guid = xmlItem.guid[0]
		if (item.guid._)
			item.guid = item.guid._
	}
	if (xmlItem.$ && xmlItem.$['rdf:about'])
		item['rdf:about'] = xmlItem.$['rdf:about']

	if (xmlItem.category)
		item.categories = xmlItem.category
	setISODate(item)
	return item
}

function decorateItunes(feed, channel) {
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

/**
 * Generates a pagination object where the rel attribute is the key and href attribute is the value
 *  { self: 'self-url', first: 'first-url', ...  }
 *
 * @access private
 * @param {Object} channel parsed XML
 * @returns {PaginationLinks}
 */
function generatePaginationLinks(channel) {
	if (!channel['atom:link'])
		return {}

	const paginationRelAttributes = ['self', 'first', 'next', 'prev', 'last']

	return channel['atom:link'].reduce((paginationLinks, link) => {
		if (!link.$ || !paginationRelAttributes.includes(link.$.rel))
			return paginationLinks

		paginationLinks[link.$.rel] = link.$.href
		return paginationLinks
	}, {})
}
