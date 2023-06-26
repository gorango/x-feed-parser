# Universal Feed Parser

Parse [RSS](#parseXmlFeedstr), [Atom](#parseXmlFeedstr), [JSON Feed](#parseJsonFeedstr), and even raw [HTML](#parseHtmlFeedstr) into a common JSON format.

## Install

```sh
npm install xfp
```

## Usage

```js
import { parse } from 'xfp'

let rawFeedString // XML (RSS/Atom), JSON Feed, or HTML string
const feed = await parse(rawFeedString)
```

Running the code above with a valid `rawFeedString` returns a response with the following [Typescript signature][types]:

```ts
Promise<{
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
		// youtube, itunes metadata
		[key: string]: any
	}
}>
```

See the [`test/`](test/) folder for complete usage examples.

## API

This library exports the [`parser`](#parser) function, which is a thin wrapper for [`parseXmlFeed`](#parseXmlFeedstr), [`parseJsonFeed`](#parseJsonFeedstr), and [`parseHtmlFeed`](#parseHtmlFeedstr).

### `parser(str)`

The parser simply identifies the filetype (`xml`, `json`, or `html`) and assigns the appropriate parser below.

### `parseXmlFeed(str)`

Handler for [RSS][rss] (v0.9 - v2.0) and [Atom][atom] feeds.

### `parseJsonFeed(str)`

Handler for [JSON feeds][json].

### `parseHtmlFeed(str)`

Handler for HTML feeds extracts page and posts metadata from the document using [rehype-extract-meta][rehype-meta] and [rehype-extract-posts][rehype-posts].

## License

[MIT][license] © [Goran Spasojevic][author]



<!-- Definitions -->

[types]: ./types.d.ts
[json]: https://www.jsonfeed.org/version/1/
[rss]: https://validator.w3.org/feed/docs/rss2.html
[atom]: https://validator.w3.org/feed/docs/atom.html
[rehype-meta]: https://github.com/gorango/rehype-extract-meta
[rehype-posts]: https://github.com/gorango/rehype-extract-posts
[license]: license
[author]: https://github.com/gorango
