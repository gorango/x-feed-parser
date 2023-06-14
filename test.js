import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'tape'
import { parse } from './index.js'

const root = join('./fixtures')

test('Fixtures', async (t) => {
	await Promise.all(readdirSync(root).map(async (fixture) => {
		const inputPath = join(root, fixture, readdirSync(join(root, fixture))[0])
		const optionsPath = join(root, fixture, 'options.json')
		const outputPath = join(root, fixture, 'output.json')
		const file = readFileSync(inputPath, 'utf-8')

		let options
		try {
			options = JSON.parse(readFileSync(optionsPath, 'utf-8'))
		}
		catch (error) {
			options = {}
		}

		const actual = await parse(file, options)

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

	t.end()
})

test('throws useful errors', (t) => {
	t.end()
})
