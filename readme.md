# (X) Feed Parser

[![Types][types-badge]][types-link]
[![Size][size-badge]][size-link]

Parse [RSS](#parseXmlFeedstr), [Atom](#parseXmlFeedstr), [JSON Feed](#parseJsonFeedstr), and [HTML](#parseHtmlFeedstr) into a common JSON format. Complete with XML decoding, HTML sanitization, date standardization, media and metadata extraction.

This project is based on the [rbren/rss-parser][rss-parser] upgraded to [ESM][esm] with [JSDoc][jsdoc] types and the addition of features above.

## Install

```sh
npm install x-feed-parser
```

## Usage

```js
import { parse } from 'x-feed-parser'

let rawFeedString // XML (RSS/Atom), JSON Feed, or HTML
const feed = parse(rawFeedString)
```

Running the code above with a valid `rawFeedString` returns a response with the following [schema][types]:

```
{
	type: 'rss' | 'atom' | 'json' | 'html'
	lang?: string
	title?: string
	description?: string
	feedUrl?: string
	siteUrl?: string
	imageUrl?: string
	etag?: string
	updatedAt?: string
	items?: [{
		id?: string
		url?: string
		lang?: string
		title?: string
		summary?: string
		author?: string
		content?: string
		snippet?: string
		categories?: string[]
		commentsUrl?: string
		imageUrl?: string
		media?: [{
			url: string
			length?: number
			type?: string
		}]
		createdAt?: string
		updatedAt?: string
	}]
	meta?: {
		[key: string]: any // youtube, itunes metadata
	}
}
```

See the [`test/`](test/) folder for complete usage examples.

## API

This library exports the [`parse`](#parse) function, which is a thin wrapper for [`parseXmlFeed`](#parseXmlFeedstr), [`parseJsonFeed`](#parseJsonFeedstr), and [`parseHtmlFeed`](#parseHtmlFeedstr).

### `parse(str)`

Identifies the filetype (`xml`, `json`, or `html`) and assigns the appropriate parser.

```js
import { parse } from 'x-feed-parser'
```

### `parseXmlFeed(str)`

Handler for [RSS][rss] (v0.9 - v2.0) and [Atom][atom] feeds.

```js
import { parseXmlFeed } from 'x-feed-parser'
```

### `parseJsonFeed(str)`

Handler for [JSON feeds][json] (v1).

```js
import { parseJsonFeed } from 'x-feed-parser'
```

### `parseHtmlFeed(str)`

**WIP!** Extracts feed data from an HTML document using [rehype-extract-meta][rehype-meta] and [rehype-extract-posts][rehype-posts].

```js
import { parseHtmlFeed } from 'x-feed-parser'
```

## License

[MIT][license] © [Goran Spasojevic][author]



<!-- Definitions -->

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
[jsdoc]: https://github.com/jsdoc/jsdoc
[types-badge]: https://badgen.net/npm/types/x-feed-parser
[types-link]: https://www.npmjs.com/package/x-feed-parser
[size-badge]: https://packagephobia.com/badge?p=x-feed-parser
[size-link]: https://packagephobia.com/result?p=x-feed-parser
[rss-parser]: https://github.com/rbren/rss-parser
[types]: ./types.ts
[json]: https://www.jsonfeed.org/version/1/
[rss]: https://validator.w3.org/feed/docs/rss2.html
[atom]: https://validator.w3.org/feed/docs/atom.html
[rehype-meta]: https://www.npmjs.com/package/rehype-extract-meta
[rehype-posts]: https://www.npmjs.com/package/rehype-extract-posts
[license]: license
[author]: https://github.com/gorango
