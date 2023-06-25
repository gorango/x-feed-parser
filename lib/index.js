/** @typedef {import('../types').Feed} Feed */
import { buildJsonFeed } from './json.js'
import { buildXmlFeed } from './xml.js'
import { buildHtmlFeed } from './html.js'

/**
 * parse RSS/Atom/JSON/HTML feed
 *
 * @param {String} str raw json, xml, or html
 * @returns {Promise<Feed>} feed object
 */
export function parse(str) {
	let feed

	if (str.startsWith('{'))
		feed = buildJsonFeed(str)

	if (str.startsWith('<?'))
		feed = buildXmlFeed(str)

	if (str.startsWith('<!'))
		feed = buildHtmlFeed(str)

	if (!feed)
		return Promise.reject(Error('Feed not recognized as RSS, Atom, JSON, or HTML'))

	return Promise.resolve(feed)
}
