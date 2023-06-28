/** @typedef {import('../types.js').Feed} Feed */
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeSanitize from 'rehype-sanitize'
import rehypeMinify from 'rehype-preset-minify'
import rehypeStringify from 'rehype-stringify'
import { toText } from 'hast-util-to-text'
import rehypeExtractPosts from 'rehype-extract-posts'
import rehypeExtractMeta from 'rehype-extract-meta'

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
 * getPosts - Attempt to build a feed object from a raw HTML string
 * @param {String} str - The raw HTML string
 * @returns {Feed} The feed object
 */
export function parseHtmlFeed(str) {
	const file = { value: str }
	const processor = unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeExtractMeta)
		.use(rehypeExtractPosts)
	const tree = processor.parse(file)
	processor.runSync(tree, file)

	if (isUnlikeyFeed(file))
		return null

	return {
		type: 'html',
		title: file.data.meta.title,
		description: file.data.meta.description,
		feedUrl: file.data.meta.altUrl,
		siteUrl: file.data.meta.url,
		imageUrl: file.data.meta.imageUrl,
		updatedAt: file.data.meta.updatedAt,
		items: file.data.posts.map(post => ({
			...post,
		})),
	}
}

function isUnlikeyFeed(file) {
	const { meta, posts } = file.data
	if (!meta || !posts)
		return true
	if (!meta.title || !meta.description || !meta.url)
		return true
	if (posts.length === 0)
		return true
	return false
}
