/** @typedef {import('../types').ParserOptions} ParserOptions */
/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */
import { copyFromXML, getContent, getLink, getSnippet, setISODate } from './utils.js'

/**
 * parse Atom feed from XML object
 * @param {Object} xmlObj
 * @param {ParserOptions} options
 * @returns {Feed} feed
 */
export function buildAtomFeed(xmlObj, options) {
	const feed = { items: [] }
	copyFromXML(xmlObj.feed, feed, options.customFields.feed)
	if (xmlObj.feed.link) {
		feed.link = getLink(xmlObj.feed.link, 'alternate', 0)
		feed.feedUrl = getLink(xmlObj.feed.link, 'self', 1)
	}
	if (xmlObj.feed.title) {
		let title = xmlObj.feed.title[0] || ''
		if (title._)
			title = title._
		if (title)
			feed.title = title
	}
	if (xmlObj.feed.updated)
		feed.lastBuildDate = xmlObj.feed.updated[0]

	feed.items = (xmlObj.feed.entry || []).map(entry => parseItemAtom(entry, options))
	return feed
}

/**
 * parse Atom item from XML object
 * @param {Object} entry
 * @param {ParserOptions} options
 * @returns {Item} item
 */
function parseItemAtom(entry, options) {
	const item = {}
	copyFromXML(entry, item, options.customFields.item)
	if (entry.title) {
		let title = entry.title[0] || ''
		if (title._)
			title = title._
		if (title)
			item.title = title
	}
	if (entry.link && entry.link.length)
		item.link = getLink(entry.link, 'alternate', 0)

	if (entry.published && entry.published.length && entry.published[0].length)
		item.pubDate = new Date(entry.published[0]).toISOString()
	if (!item.pubDate && entry.updated && entry.updated.length && entry.updated[0].length)
		item.pubDate = new Date(entry.updated[0]).toISOString()
	if (entry.author && entry.author.length && entry.author[0].name && entry.author[0].name.length)
		item.author = entry.author[0].name[0]
	if (entry.content && entry.content.length) {
		item.content = getContent(entry.content[0])
		item.contentSnippet = getSnippet(item.content)
	}
	if (entry.summary && entry.summary.length)
		item.summary = getContent(entry.summary[0])

	if (entry.id)
		item.id = entry.id[0]

	setISODate(item)
	return item
}
