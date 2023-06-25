import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'vitest'
import { parse } from '../index.js'

const root = join('./fixtures')

test('Fixtures', async ({ expect }) => {
	await Promise.all(readdirSync(root).map(async (fixture) => {
		const [fileName] = readdirSync(join(root, fixture))
		const inputPath = join(root, fixture, fileName)
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

test('Unrecognized', async ({ expect }) => {
	const fixture = 'unrecognized'
	const [fileName] = readdirSync(join(root, fixture))
	const inputPath = join(root, fixture, fileName)
	const xml = readFileSync(inputPath, 'utf-8')
	await parse(xml).catch((err) => {
		expect(err.message).toBe('Feed not recognized as RSS, Atom, JSON, or HTML')
	})
})

test.skip('throws useful errors', ({ expect }) => {
	expect.fail()
})
