// https://www.jsonfeed.org/version/1/
/** @typedef {import('../types.js').Feed} Feed */
/** @typedef {import('../types.js').Item} Item */
import { getContent } from './utils.js'

/**
 * parse JSON feed
 * @param {String} str str object
 * @returns {Feed}
 */
export function parseJsonFeed(str) {
	const json = JSON.parse(str)

	if (!json.version || !json.version.match(/^https:\/\/jsonfeed.org\/version\/1/))
		return null

	return {
		type: 'json',
		...(json.title ? { title: json.title?.trim() } : {}),
		...(json.description ? { description: json.description?.trim() } : {}),
		...(json.home_page_url ? { siteUrl: json.home_page_url } : {}),
		...(json.feed_url ? { feedUrl: json.feed_url } : {}),
		...((json.etag || json.id) ? { etag: json.etag || json.id } : {}),
		...(json.title ? { updatedAt: new Date(json.updated).toISOString() } : {}),
		...(json.title ? { items: json.items.map(parseItem) } : {}),
	}
}

/**
 * @param {Object} item json item
 * @returns {Item}
 * @private
 */
function parseItem(item) {
	return {
		...((item.etag || item.id || item.url) ? { id: item.etag || item.id || item.url } : {}),
		...(item.url ? { url: item.url } : {}),
		...(item.language ? { lang: item.language } : {}),
		...(item.title ? { title: item.title?.trim() } : {}),
		...(item.author ? { author: item.author?.name } : {}),
		...(item.content_html ? { content: getContent(item.content_html) } : {}),
		...(item.content_text ? { snippet: item.content_text?.trim() } : {}),
		...(item.summary ? { summary: item.summary?.trim() } : {}),
		...(item.tags ? { categories: item.tags } : {}),
		...(item.external_url ? { commentsUrl: item.external_url } : {}),
		...(item.image || item.banner_image ? { imageUrl: item.image || item.banner_image } : {}),
		...(item.date_published ? { createdAt: new Date(item.date_published).toISOString() } : {}),
		...(item.date_modified ? { updatedAt: new Date(item.date_modified).toISOString() } : {}),
	}
}
