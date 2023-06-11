import { decodeHTML } from 'entities'
import { Builder } from 'xml2js'

/**
 * Strips HTML tags from a string
 * @param {String} str - The string to strip
 * @returns {String} The stripped string
 */
export function stripHtml(str) {
	str = str.replace(/([^\n])<\/?(h|br|p|ul|ol|li|blockquote|section|table|tr|div)(?:.|\n)*?>([^\n])/gm, '$1\n$3')
	str = str.replace(/<(?:.|\n)*?>/gm, '')
	return str
}

/**
 * Gets a snippet from a string
 * @param {String} str - The string to get a snippet from
 * @returns {String} The snippet
 */
export function getSnippet(str) {
	return decodeHTML(stripHtml(str)).trim()
}

/**
 * Gets a link from a list of links
 * @param {Array} links - The list of links
 * @param {String} rel - The rel to get
 * @param {Number} fallbackIdx - The index to fallback to if the rel is not found
 * @returns {String} The link
 */
export function getLink(links, rel, fallbackIdx) {
	if (!links)
		return
	for (let i = 0; i < links.length; ++i) {
		if (links[i].$.rel === rel)
			return links[i].$.href
	}

	if (links[fallbackIdx])
		return links[fallbackIdx].$.href
}

/**
 * Gets the content from an XML object
 * @param {Object} content - The XML object
 * @returns {String} The content
 */
export function getContent(content) {
	if (typeof content._ === 'string') {
		return content._
	}
	else if (typeof content === 'object') {
		const builder = new Builder({ headless: true, rootName: 'div', renderOpts: { pretty: false } })
		return builder.buildObject(content)
	}
	else {
		return content
	}
}

/**
 * Copies fields from an XML object to a destination object
 * @param {Object} xml - The XML object
 * @param {Object} dest - The destination object
 * @param {Array} fields - An array of fields to copy
 */
export function copyFromXML(xml, dest, fields) {
	fields.forEach((f) => {
		let from = f
		let to = f
		let options = {}
		if (Array.isArray(f)) {
			from = f[0]
			to = f[1]
			if (f.length > 2)
				options = f[2]
		}
		const { keepArray, includeSnippet } = options
		if (xml[from] !== undefined)
			dest[to] = keepArray ? xml[from] : xml[from][0]

		if (dest[to] && typeof dest[to]._ === 'string')
			dest[to] = dest[to]._

		if (includeSnippet && dest[to] && typeof dest[to] === 'string')
			dest[`${to}Snippet`] = getSnippet(dest[to])
	})
}
