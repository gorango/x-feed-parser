/** @typedef {import('../index.js').Feed} Feed */
import { copyFromXML } from './utils.js'

/** @param {String} f */
const mapItunesField = f => [`itunes:${f}`, f]

const podcastFeed = ([
	'author',
	'subtitle',
	'summary',
	'explicit',
]).map(mapItunesField)

const podcastItem = ([
	'author',
	'subtitle',
	'summary',
	'explicit',
	'duration',
	'image',
	'episode',
	'image',
	'season',
	'keywords',
	'episodeType',
]).map(mapItunesField)

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

	// copyFromXML(channel, feed.itunes, podcastFeed)
	// items.forEach((item, index) => {
	// 	const entry = feed.items[index]
	// 	entry.itunes = {}
	// 	copyFromXML(item, entry.itunes, podcastItem)
	// 	const image = item['itunes:image']
	// 	if (image && image[0] && image[0].$ && image[0].$.href)
	// 		entry.itunes.image = image[0].$.href
	// })
}
