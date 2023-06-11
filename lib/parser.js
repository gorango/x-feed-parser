import xml2js from 'xml2js'

import { fields } from './fields.js'
import {
	copyFromXML,
	getContent,
	getLink,
	getSnippet,
} from './utils'

/**
 * Parser for RSS 0.9x, 1.0, 2.0 and Atom feeds
 * @class
 * @classdesc Parses RSS, Atom and JSON feeds
 */
export class Parser {
	/**
	 * @typedef {Object} ParserOptions
	 * @property {Object} [xml2js] - Options for xml2js
	 * @property {Object} [customFields] - Custom fields to be added to the feed object
	 * @property {Array} [customFields.feed] - Custom fields to be added to the feed object
	 * @property {Array} [customFields.item] - Custom fields to be added to every item
	 * @property {Boolean} [keepArray=false] - Do not attempt to merge single element arrays into single elements
	 * @property {Boolean} [includeSnippet=false] - Include a snippet of the item's content
	 * @property {Number} [defaultRSS=2] - If feed type cannot be detected, assume RSS of this version
	 *
	 * Initialize a parser
	 * @param {ParserOptions} options
	 */
	constructor(options = {}) {
		options.xml2js = options.xml2js || {}
		options.customFields = options.customFields || {}
		options.customFields.item = options.customFields.item || []
		options.customFields.feed = options.customFields.feed || []
		this.options = options
		this.xmlParser = new xml2js.Parser(this.options.xml2js)
	}

	/**
	 * parse RSS/Atom/JSON feed
	 *
	 * @param {String} str      xml or json string
	 * @returns {Promise}
	 */
	parseString(str) {
		const prom = new Promise((resolve, reject) => {
			this.xmlParser.parseString(str, (err, result) => {
				if (err)
					return reject(err)
				if (!result)
					return reject(new Error('Unable to parse XML.'))

				let feed = null
				if (result.feed) {
					feed = this.buildAtomFeed(result)
				}
				else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/^2/)) {
					feed = this.buildRSS2(result)
				}
				else if (result['rdf:RDF']) {
					feed = this.buildRSS1(result)
				}
				else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/0\.9/)) {
					feed = this.buildRSS0_9(result)
				}
				else if (result.rss && this.options.defaultRSS) {
					switch (this.options.defaultRSS) {
						case 0.9:
							feed = this.buildRSS0_9(result)
							break
						case 1:
							feed = this.buildRSS1(result)
							break
						case 2:
							feed = this.buildRSS2(result)
							break
						default:
							return reject(new Error('default RSS version not recognized.'))
					}
				}
				else {
					return reject(new Error('Feed not recognized as RSS 1 or 2.'))
				}
				resolve(feed)
			})
		})
		return prom
	}

	/**
	 * parse Atom feed from XML object
	 * @param {Object} xmlObj
	 * @returns {Object} feed
	 */
	buildAtomFeed(xmlObj) {
		const feed = { items: [] }
		copyFromXML(xmlObj.feed, feed, this.options.customFields.feed)
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

		feed.items = (xmlObj.feed.entry || []).map(entry => this.parseItemAtom(entry))
		return feed
	}

	/**
	 * parse Atom item from XML object
	 * @param {Object} entry
	 * @returns {Object} item
	 */
	parseItemAtom(entry) {
		const item = {}
		copyFromXML(entry, item, this.options.customFields.item)
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

		this.setISODate(item)
		return item
	}

	buildRSS0_9(xmlObj) {
		const channel = xmlObj.rss.channel[0]
		const items = channel.item
		return this.buildRSS(channel, items)
	}

	buildRSS1(xmlObj) {
		xmlObj = xmlObj['rdf:RDF']
		const channel = xmlObj.channel[0]
		const items = xmlObj.item
		return this.buildRSS(channel, items)
	}

	buildRSS2(xmlObj) {
		const channel = xmlObj.rss.channel[0]
		const items = channel.item
		const feed = this.buildRSS(channel, items)
		if (xmlObj.rss.$ && xmlObj.rss.$['xmlns:itunes'])
			this.decorateItunes(feed, channel)

		return feed
	}

	buildRSS(channel, items) {
		items = items || []
		const feed = { items: [] }
		const feedFields = fields.feed.concat(this.options.customFields.feed)
		const itemFields = fields.item.concat(this.options.customFields.item)
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
		const paginationLinks = this.generatePaginationLinks(channel)
		if (Object.keys(paginationLinks).length)
			feed.paginationLinks = paginationLinks

		copyFromXML(channel, feed, feedFields)
		feed.items = items.map(xmlItem => this.parseItemRss(xmlItem, itemFields))
		return feed
	}

	parseItemRss(xmlItem, itemFields) {
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
		this.setISODate(item)
		return item
	}

	decorateItunes(feed, channel) {
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
	 * Set ISO formatted date string to item
	 * @param {Object} item
	 */
	setISODate(item) {
		const date = item.pubDate || item.date
		if (date) {
			try {
				item.isoDate = new Date(date.trim()).toISOString()
			}
			catch (e) {
				// Ignore bad date format
			}
		}
	}

	/**
	 * Generates a pagination object where the rel attribute is the key and href attribute is the value
	 *  { self: 'self-url', first: 'first-url', ...  }
	 *
	 * @access private
	 * @param {Object} channel parsed XML
	 * @returns {Object}
	 */
	generatePaginationLinks(channel) {
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
}
