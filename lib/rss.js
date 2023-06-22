/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */
import { decodeXML } from 'entities'
import { fields } from './fields.js'
import { copyFromXML, getContent, getImageUrl } from './utils.js'
import { getSnippet } from './html.js'
import { decorateItunes } from './itunes.js'

/**
 * parse RSS feed
 * @param {Object} xmlObj
 * @returns {Feed} feed
 */
export function buildRSSFeed(xmlObj) {
	const isRSS2 = Boolean(xmlObj?.rss?.$?.version?.match(/^2/))
	const isRSS1 = Boolean(xmlObj['rdf:RDF'])
	const isRSS0 = Boolean(xmlObj?.rss?.$?.version?.match(/0\.9/))

	if (!isRSS2 && !isRSS1 && !isRSS0)
		return null
		// throw new Error('Feed not recognized as RSS 1 or 2.')

	const channel = isRSS1 ? xmlObj['rdf:RDF']?.channel[0] : xmlObj.rss.channel[0]
	const items = isRSS1 ? xmlObj['rdf:RDF']?.item : channel.item

	const specFeed = copyFromXML(channel, fields.feed)
	const feed = {}
	feed.type = 'rss'
	feed.title = decodeXML(specFeed.title)?.trim()
	feed.description = decodeXML(specFeed.description)?.trim()

	if (channel.image && channel.image[0] && channel.image[0].url) {
		const image = channel.image[0]
		if (image.link)
			feed.imageUrl = image.link[0]
		if (image.url)
			feed.imageUrl = image.url[0]
	}

	if (channel.link)
		feed.siteUrl = channel.link[0]
	if (channel['atom:link'] && channel['atom:link'][0] && channel['atom:link'][0].$)
		feed.feedUrl = channel['atom:link'][0].$.href

	feed.items = items.map(xmlItem => parseItemRss(xmlItem))

	if (specFeed.etag)
		feed.etag = specFeed.etag

	if (specFeed.updatedAt)
		feed.updatedAt = new Date(specFeed.updatedAt).toISOString()

	if (xmlObj.rss?.$ && xmlObj.rss.$['xmlns:itunes'])
		decorateItunes(feed, channel)

	return feed
}

/**
 * parse RSS item from XML object
 * @param {Object} xmlItem
 * @returns {Item} item
 */
function parseItemRss(xmlItem) {
	const item = {}
	const specItem = copyFromXML(xmlItem, fields.item)

	if (xmlItem.guid) {
		item.id = xmlItem.guid[0]
		if (item.id._)
			item.id = item.id._
	}

	if (xmlItem.link)
		item.url = xmlItem.link?.[0] || xmlItem.link

	if (specItem.lang)
		item.lang = specItem.lang.trim()

	if (specItem.title)
		item.title = decodeXML(specItem.title).trim()

	if (specItem.summary)
		item.commentsUrl = specItem.summary.trim()

	if (specItem.author)
		item.author = specItem.author.trim()

	if (xmlItem.description)
		item.content = getContent(xmlItem.description[0])

	if (xmlItem['content:encoded']) {
		item.content = getContent(decodeXML(xmlItem['content:encoded'][0]))
		item.snippet = getSnippet(item.content).trim()
	}

	if (xmlItem['media:group']?.[0]?.['media:description'])
		item.content = getContent(xmlItem['media:group']?.[0]?.['media:description']).trim()

	if (item.content)
		item.snippet = getSnippet(item.content)

	if (xmlItem.category)
		item.categories = xmlItem.category

	if (specItem.comments)
		item.commentsUrl = specItem.comments

	const imageUrl = getImageUrl(xmlItem)
	if (imageUrl)
		item.imageUrl = imageUrl

	if (xmlItem.enclosure?.length)
		item.media = xmlItem.enclosure.map(({ $ }) => $)

	if (specItem.createdAt)
		item.createdAt = new Date(specItem.createdAt).toISOString()

	if (specItem.updatedAt)
		item.updatedAt = new Date(specItem.updatedAt).toISOString()

	return item
}
