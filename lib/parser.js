/** @typedef {import('../index.js').ParserOptions} ParserOptions */
/** @typedef {import('../index.js').Feed} Feed */
import xml2js from 'xml2js'
import { buildAtomFeed } from './atom.js'
import { buildRSS0_9, buildRSS1, buildRSS2 } from './rss.js'
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

			let feed = null
			if (result.feed) {
				feed = buildAtomFeed(result, options)
			}
			else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/^2/)) {
				feed = buildRSS2(result, options)
			}
			else if (result['rdf:RDF']) {
				feed = buildRSS1(result, options)
			}
			else if (result.rss && result.rss.$ && result.rss.$.version && result.rss.$.version.match(/0\.9/)) {
				feed = buildRSS0_9(result, options)
			}
			else if (result.rss && options.defaultRSS) {
				switch (options.defaultRSS) {
					case 0.9:
						feed = buildRSS0_9(result, options)
						break
					case 1:
						feed = buildRSS1(result, options)
						break
					case 2:
						feed = buildRSS2(result, options)
						break
					default:
						return reject(new Error('default RSS version not recognized.'))
				}
			}
			else {
				return reject(new Error('Feed not recognized as RSS 1 or 2.'))
			}
			resolve(feed)
		})
	})
}
