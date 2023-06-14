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
	type?: 'rss' | 'atom' | 'json'
	title?: string
	description?: string
	feedUrl?: string
	link?: string
	paginationLinks?: PaginationLinks
	items: [{
		guid?: string
		link?: string
		title?: string
		snippet?: string
		date?: string
		creator?: string
		summary?: string
		content?: string
		isoDate?: string
		categories?: string[]
	}]
}
```
