// https://www.jsonfeed.org/version/1/
/** @typedef {import('../types').Feed} Feed */
/** @typedef {import('../types').Item} Item */

/**
 * parse JSON feed
 * @param {String} str str object
 * @returns {Feed}
 */
export function buildJsonFeed(str) {
	const json = JSON.parse(str)

	if (!json.version || !json.version.match(/^https:\/\/jsonfeed.org\/version\/1/))
		return null

	return {
		type: 'json',
		title: json.title?.trim(),
		description: json.description?.trim(),
		siteUrl: json.home_page_url,
		feedUrl: json.feed_url,
		etag: json.etag || json.id,
		updatedAt: new Date(json.updated).toISOString(),
		items: json.items.map(buildItem),
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
		title: item.title?.trim(),
		summary: item.summary?.trim(),
		author: item.author?.name,
		content: item.content_html?.trim(),
		snippet: item.content_text?.trim(),
		categories: item.tags,
		commentsUrl: item.external_url,
		imageUrl: item.image || item.banner_image,
		createdAt: new Date(item.date_published).toISOString(),
		updatedAt: new Date(item.date_modufied).toISOString(),
	}
}
