import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize from 'rehype-sanitize'
import rehypeMinify from 'rehype-preset-minify'
import rehypeStringify from 'rehype-stringify'
import { toText } from 'hast-util-to-text'
// import rehypeExtractPosts from 'rehype-extract-posts'

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
 * getPosts - Tries to get potential posts in the hast tree
 */
// async function extractPosts(html) {
// 	const file = { value: html }
// 	const pluginOptions = {}
// 	const processor = unified()
// 		.use(rehypeParse, { fragment: true })
// 		.use(rehypeExtractPosts, pluginOptions)
// 	const tree = processor.parse(file)
// 	await processor.run(tree, file)
// 	console.log(file)
// }
