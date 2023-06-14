/** @typedef {import('../index.js').ParserOptions} ParserOptions */
/** @typedef {import('../index.js').Feed} Feed */
import xml2js from 'xml2js'
import { buildAtomFeed } from './atom.js'
import { buildRSSFeed } from './rss.js'
import { buildJSONFeed } from './json.js'

/**
 * parse RSS/Atom/JSON feed
 *
 * @param {String} str json or xml string
 * @param {ParserOptions} options options object
 * @returns {Promise<Feed>} feed object
 */
export function parse(str, options = {}) {
	options.customFields = options.customFields || {}
	options.customFields.item = options.customFields.item || []
	options.customFields.feed = options.customFields.feed || []

	return new Promise((resolve, reject) => {
		let feed = null

		try {
			const json = JSON.parse(str)
			if (json.version && json.version.match(/^https:\/\/jsonfeed.org\/version\/1/))
				feed = buildJSONFeed(json)
		}
		catch (err) { /* ignore error */ }

		new xml2js.Parser(options.xml2js).parseString(str, (err, result) => {
			if (err)
				return reject(err)
			if (!result)
				return reject(new Error('Unable to parse XML.'))

			feed = result.feed
				? buildAtomFeed(result, options)
				: buildRSSFeed(result, options)

			resolve(feed)
		})
	})
}
