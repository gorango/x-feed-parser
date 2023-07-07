/** @typedef {import('../types.js').Feed} Feed */
import { parseJsonFeed } from './json.js'
import { parseXmlFeed } from './xml.js'
import { parseHtmlFeed } from './html.js'

/**
 * parse RSS/Atom/JSON/HTML feed
 *
 * @param {String} str raw json, xml, or html
 * @returns {Feed | null} feed object
 */
export function parse(str) {
	let feed = null
	str = str.trim()

	if (str.startsWith('{'))
		feed = parseJsonFeed(str)

	if (['<?', '<r'].some(s => str.startsWith(s)))
		feed = parseXmlFeed(str)

	if (['<!', '<h'].some(s => str.startsWith(s)))
		feed = parseHtmlFeed(str)

	// if (!feed) // ('Feed not recognized as RSS, Atom, JSON, or HTML')

	return feed
}
