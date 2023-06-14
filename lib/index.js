/** @typedef {import('../index.js').Feed} Feed */
import xml2js from 'xml2js'
import { buildAtomFeed } from './atom.js'
import { buildRSSFeed } from './rss.js'
import { buildJSONFeed } from './json.js'

/**
 * parse RSS/Atom/JSON feed
 *
 * @param {String} str json or xml string
 * @returns {Promise<Feed>} feed object
 */
export function parse(str) {
	return new Promise((resolve, reject) => {
		let feed = null

		try {
			const json = JSON.parse(str)
			if (json.version && json.version.match(/^https:\/\/jsonfeed.org\/version\/1/))
				feed = buildJSONFeed(json)
		}
		catch (err) { /* ignore error */ }

		new xml2js.Parser().parseString(str, (err, xml) => {
			if (err)
				return reject(err)
			if (!xml)
				return reject(new Error('Unable to parse XML.'))

			feed = xml.feed
				? buildAtomFeed(xml)
				: buildRSSFeed(xml)

			resolve(feed)
		})
	})
}
