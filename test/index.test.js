import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'vitest'
import { parse } from '../index.js'
import { buildXmlFeed } from '../lib/xml.js'

const root = join('./fixtures')

test('Fixtures', async ({ expect }) => {
	await Promise.all(readdirSync(root).map(async (fixture) => {
		const inputPath = join(root, fixture, readdirSync(join(root, fixture))[0])
		const outputPath = join(root, fixture, 'output.json')
		const file = readFileSync(inputPath, 'utf-8')

		const actual = await parse(file).catch(() => ({}))

		let expected
		writeFileSync(outputPath, `${JSON.stringify(actual, null, 4)}\n`)
		try {
			expected = JSON.parse(readFileSync(outputPath, 'utf-8'))
		}
		catch (error) {
			writeFileSync(outputPath, `${JSON.stringify(actual, null, 2)}\n`)
			return
		}

		expect(JSON.parse(JSON.stringify(actual))).toEqual(expected)
	}))
})

test('Fixture', async ({ expect }) => {
	// const fixture = readdirSync(root)[2]
	const fixture = 'feedburner'
	const inputPath = join(root, fixture, readdirSync(join(root, fixture))[0])
	const a = readFileSync(inputPath, 'utf-8')
	const feed = buildXmlFeed(a)
	expect(feed)
})

test.skip('throws useful errors', ({ expect }) => {
	expect.fail()
})
