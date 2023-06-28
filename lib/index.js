/** @typedef {import('../types.js').Feed} Feed */
import { parseJsonFeed } from './json.js'
import { parseXmlFeed } from './xml.js'
import { parseHtmlFeed } from './html.js'

/**
 * parse RSS/Atom/JSON/HTML feed
 *
 * @param {String} str raw json, xml, or html
 * @returns {Promise<Feed>} feed object
 */
export function parse(str) {
	let feed

	if (str.startsWith('{'))
		feed = parseJsonFeed(str)

	if (str.startsWith('<?'))
		feed = parseXmlFeed(str)

	if (str.startsWith('<!'))
		feed = parseHtmlFeed(str)

	if (!feed)
		return Promise.reject(Error('Feed not recognized as RSS, Atom, JSON, or HTML'))

	return Promise.resolve(feed)
}
