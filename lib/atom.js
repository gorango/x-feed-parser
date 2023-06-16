/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */
import { decodeXML } from 'entities'
import { fields } from './fields.js'
import { copyFromXML, getContent, getImageUrl, getLink } from './utils.js'
import { getSnippet } from './html.js'

/**
 * parse Atom feed from XML object
 * @param {Object} xmlObj
 * @returns {Feed} feed
 */
export function buildAtomFeed(xmlObj) {
	const specFeed = copyFromXML(xmlObj.feed, fields.feed)
	const feed = {}
	feed.type = 'atom'

	if (xmlObj.feed.title) {
		let title = xmlObj.feed.title[0] || ''
		if (title._)
			title = title._
		if (title)
			feed.title = decodeXML(title)
	}

	if (specFeed.description)
		feed.description = decodeXML(specFeed.description)

	if (xmlObj.feed.link) {
		feed.siteUrl = getLink(xmlObj.feed.link, 'alternate', 0)
		feed.feedUrl = getLink(xmlObj.feed.link, 'self', 1)
	}

	if (feed.author) {
		if (feed.author.length && feed.author[0]?.name?.length)
			feed.author = feed.author[0].name[0]
		if (feed.author.name?.length)
			feed.author = feed.author.name[0]
	}

	feed.items = (xmlObj.feed.entry || []).map(entry => parseItemAtom(entry))

	if (specFeed.etag)
		feed.etag = specFeed.etag

	if (xmlObj.feed.updated)
		feed.updatedAt = xmlObj.feed.updated[0]
	if (feed.updatedAt)
		feed.updatedAt = new Date(feed.updatedAt).toISOString()

	return feed
}

/**
 * parse Atom item from XML object
 * @param {Object} xmlItem
 * @returns {Item} item
 */
function parseItemAtom(xmlItem) {
	const item = {}
	const specItem = copyFromXML(xmlItem, fields.item)

	if (xmlItem.id)
		item.id = xmlItem.id[0]

	if (xmlItem.link && xmlItem.link.length)
		item.url = getLink(xmlItem.link, 'alternate', 0)

	if (xmlItem.title) {
		let title = xmlItem.title[0] || ''
		if (title._)
			title = title._
		if (title)
			item.title = decodeXML(title)
	}

	if (xmlItem.summary && xmlItem.summary.length)
		item.summary = getContent(xmlItem.summary[0])

	if (xmlItem.author) {
		if (xmlItem.author.length && xmlItem.author[0]?.name?.length)
			item.author = xmlItem.author[0].name[0]
		if (xmlItem.author.name?.length)
			item.author = xmlItem.author.name[0]
	}

	if (xmlItem.content && xmlItem.content.length) {
		item.content = getContent(xmlItem.content[0])
		item.snippet = getSnippet(item.content)
	}

	if (!item.content && xmlItem['media:group']?.[0]?.['media:description']?.[0]) {
		item.content = decodeXML(xmlItem['media:group']?.[0]?.['media:description'][0])
		item.snippet = getSnippet(item.content)
	}

	if (xmlItem.category)
		item.categories = xmlItem.category.map(({ $ }) => $.term)

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
