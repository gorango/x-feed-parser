# Universal Feed Parser



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

Running the code above with a valid `rawFeedString` returns the following:

```ts
interface Promise<Feed> {
	type?: 'rss' | 'atom' | 'json' | 'html'
	lang?: string
	title?: string
	description?: string
	feedUrl?: string
	siteUrl?: string
	imageUrl?: string
	etag?: string
	updatedAt?: string
	items: [{
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
		media?: Enclosure[]
		createdAt?: string
		updatedAt?: string
	}]
	meta?: {
		// youtube, itunes metadata
		[key: string]: any
	}
}
```

## License

[MIT][license] © [Goran Spasojevic][author]

<!-- Definitions -->

[license]: license
[author]: https://github.com/gorango
