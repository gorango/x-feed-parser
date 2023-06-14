/** @typedef {import('../index.js').Feed} Feed */
/** @typedef {import('../index.js').Item} Item */
import { fields } from './fields.js'
import { copyFromXML, decorateItunes, getContent, getSnippet } from './utils.js'

/**
 * parse RSS feed
 * @param {Object} xmlObj
 * @returns {Feed} feed
 */
export function buildRSSFeed(xmlObj) {
	let feed
	if (xmlObj.rss && xmlObj.rss.$ && xmlObj.rss.$.version && xmlObj.rss.$.version.match(/^2/))
		feed = buildRSS2(xmlObj)
	else if (xmlObj['rdf:RDF'])
		feed = buildRSS1(xmlObj)
	else if (xmlObj.rss && xmlObj.rss.$ && xmlObj.rss.$.version && xmlObj.rss.$.version.match(/0\.9/))
		feed = buildRSS0_9(xmlObj)
	else
		throw new Error('Feed not recognized as RSS 1 or 2.')
	return feed
}

/**
 * parse RSS v0.9
 * @param {Object} xmlObj
 * @returns {Feed} feed
 */
function buildRSS0_9(xmlObj) {
	const channel = xmlObj.rss.channel[0]
	const items = channel.item
	return buildRSS(channel, items)
}

/**
 * parse RSS v1
 * @param {Object} xmlObj
 * @returns {Feed} feed
 */
function buildRSS1(xmlObj) {
	xmlObj = xmlObj['rdf:RDF']
	const channel = xmlObj.channel[0]
	const items = xmlObj.item
	return buildRSS(channel, items)
}

/**
 * parse RSS v2
 * @param {Object} xmlObj
 * @returns {Feed} feed
 */
function buildRSS2(xmlObj) {
	const channel = xmlObj.rss.channel[0]
	const items = channel.item
	const feed = buildRSS(channel, items)
	if (xmlObj.rss.$ && xmlObj.rss.$['xmlns:itunes'])
		decorateItunes(feed, channel)

	return feed
}

/**
 * Build RSS
 * @param {Object} channel
 * @param {Object[]} items
 * @returns {Feed} feed
 */
function buildRSS(channel, items) {
	items = items || []
	const feed = {}
	feed.type = 'rss'
	if (channel.link)
		feed.siteUrl = channel.link[0]
	if (channel['atom:link'] && channel['atom:link'][0] && channel['atom:link'][0].$)
		feed.feedUrl = channel['atom:link'][0].$.href

	if (channel.image && channel.image[0] && channel.image[0].url) {
		const image = channel.image[0]
		if (image.link)
			feed.imageUrl = image.link[0]
		if (image.url)
			feed.imageUrl = image.url[0]
	}

	copyFromXML(channel, feed, fields.feed)
	feed.items = items.map(xmlItem => parseItemRss(xmlItem, fields.item))
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
		item.snippet = getSnippet(item.content)
	}
	if (xmlItem.guid) {
		item.guid = xmlItem.guid[0]
		if (item.guid._)
			item.guid = item.guid._
	}
	if (xmlItem.category)
		item.categories = xmlItem.category

	if (xmlItem.link)
		item.url = xmlItem.link

	if (item.date)
		item.date = new Date(item.date).toISOString()

	return item
}
