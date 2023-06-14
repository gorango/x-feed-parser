// https://www.jsonfeed.org/version/1/
/** @typedef {import('../index.js').Feed} Feed */
/** @typedef {import('../index.js').Item} Item */

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
	}
}

/**
 * @param {Object} item json item
 * @returns {Item}
 * @private
 */
function buildItem(item) {
	return {
		url: item.url,
		title: item.title,
		date: new Date(item.date_published).toISOString(),
		creator: item.author,
		summary: item.summary,
		content: item.content_html,
		categories: item.tags,
		snippet: item.content_text,
		imageUrl: item.image || item.banner_image,
	}
}
