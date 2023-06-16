// https://www.jsonfeed.org/version/1/
/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */

/**
 * parse JSON feed
 * @param {Object} json json object
 * @returns {Feed}
 */
export function buildJSONFeed(json) {
	return {
		type: 'json',
		title: json.title,
		description: json.description,
		siteUrl: json.home_page_url,
		feedUrl: json.feed_url,
		items: json.items.map(buildItem),
		etag: json.etag || json.id,
		updatedAt: new Date(json.updated).toISOString(),
	}
}

/**
 * @param {Object} item json item
 * @returns {Item}
 * @private
 */
function buildItem(item) {
	return {
		id: item.etag || item.id || item.url,
		url: item.url,
		lang: item.language,
		title: item.title,
		summary: item.summary,
		author: item.author?.name,
		content: item.content_html,
		snippet: item.content_text,
		categories: item.tags,
		commentsUrl: item.external_url,
		imageUrl: item.image || item.banner_image,
		createdAt: new Date(item.date_published).toISOString(),
		updatedAt: new Date(item.date_modufied).toISOString(),
	}
}
