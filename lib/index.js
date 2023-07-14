/** @typedef {import('./types.js').Feed} Feed */
/** @typedef {import('./types.js').Item} Item */
import { parseJsonFeed } from './json.js'
import { parseXmlFeed } from './xml.js'
import { parseHtmlFeed } from './html.js'

/**
 * parse RSS/Atom/JSON/HTML feed
 *
 * @param {String} str raw json, xml, or html
 * @returns {Feed | null} feed object
 */
function parse(str) {
	let feed = null
	str = str.trimStart()

	if (str.startsWith('{'))
		feed = parseJsonFeed(str)

	if (['<?', '<r'].some(s => str.startsWith(s)))
		feed = parseXmlFeed(str)

	if (['<!', '<h'].some(s => str.startsWith(s)))
		feed = parseHtmlFeed(str)

	// if (!feed) // ('Feed not recognized as RSS, Atom, JSON, or HTML')

	return feed
}

export {
	parse,
	parseJsonFeed,
	parseXmlFeed,
	parseHtmlFeed,
}
