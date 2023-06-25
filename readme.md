# Universal Feed Parser



## Install

```sh
npm install xfp
```

## Usage

```js
import { parse } from 'xfp'

let rawFeedString // XML or JSON string
const feed = parse(rawFeedString)
```

### Returns

```ts
interface Feed {
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
		keywords?: string[]
		commentsUrl?: string
		imageUrl?: string
		media?: Enclosure[]
		createdAt?: string
		updatedAt?: string
	}]
	meta?: {
		[key: string]: any
	}
}
```
