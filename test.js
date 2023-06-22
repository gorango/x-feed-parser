import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'vitest'
import { parse } from './index.js'

const root = join('./fixtures')

test('Fixtures', async ({ expect }) => {
	await Promise.all(readdirSync(root).map(async (fixture) => {
		const inputPath = join(root, fixture, readdirSync(join(root, fixture))[0])
		const outputPath = join(root, fixture, 'output.json')
		const file = readFileSync(inputPath, 'utf-8')

		const actual = await parse(file)

		// let expected
		writeFileSync(outputPath, `${JSON.stringify(actual, null, 2)}\n`)
		// try {
		// 	expected = JSON.parse(readFileSync(outputPath, 'utf-8'))
		// }
		// catch (error) {
		// 	writeFileSync(outputPath, `${JSON.stringify(actual, null, 2)}\n`)
		// 	return
		// }

		// t.deepLooseEqual(actual, expected, `should work on ${fixture}`)
	}))
})

test('throws useful errors', ({ expect }) => {
})
