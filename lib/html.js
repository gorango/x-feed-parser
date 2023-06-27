/** @typedef {import('../types.js').Feed} Feed */
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize from 'rehype-sanitize'
import rehypeMinify from 'rehype-preset-minify'
import rehypeStringify from 'rehype-stringify'
import { toText } from 'hast-util-to-text'

export function sanitizeHtml(value) {
	return unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeSanitize, { strip: ['link', 'script', 'style'] })
		.use(rehypeMinify)
		.use(rehypeStringify)
		.processSync({ value })
}

/**
 * Gets a snippet from a string
 * @param {String} str - The string to get a snippet from
 * @returns {String} The snippet
 */
export function getSnippet(str) {
	const hast = unified().use(rehypeParse, { fragment: true }).parse(str)
	return toText(hast)?.trim()
	// return decodeHTML(stripHtml(str)).trim()
}

/**
 * getPosts - Tries to get potential posts in the hast tree\
 * @param {String} _str - The HTML string to parse
 * @returns {Feed | null} - The feed object or null if none found
 */
export function parseHtmlFeed(_str) {
	console.log('HTML not implemented') // eslint-disable-line no-console
	return null
}
