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
		title: json.title,
		description: json.description,
		link: json.home_page_url,
		feedUrl: json.feed_url,
		items: json.items.map(buildItem),
	}
}

/**
 * @param {Object} item json item
 * @returns {Item & {image: any}}
 * @private
 */
function buildItem(item) {
	return {
		link: item.url,
		title: item.title,
		pubDate: item.date_published,
		creator: item.author,
		summary: item.summary,
		content: item.content_html,
		categories: item.tags,
		contentSnippet: item.content_text,
		enclosure: item.attachments?.[0],
		image: item.image || item.banner_image,
	}
}
