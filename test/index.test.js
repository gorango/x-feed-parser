import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'vitest'
import { parse } from '../lib/index.js'

const root = join('./fixtures')

test('Fixtures', async ({ expect }) => {
	await Promise.all((await readdir(root)).map(async (fixture) => {
		const [fileName] = await readdir(join(root, fixture))
		const inputPath = join(root, fixture, fileName)
		const outputPath = join(root, fixture, 'output.json')
		const file = await readFile(inputPath, 'utf-8')

		const actual = parse(file)

		let expected
		await writeFile(outputPath, `${JSON.stringify(actual, null, 4)}\n`)
		try {
			expected = JSON.parse(await readFile(outputPath, 'utf-8'))
		}
		catch (error) {
			await writeFile(outputPath, `${JSON.stringify(actual, null, 2)}\n`)
			return
		}

		expect(JSON.parse(JSON.stringify(actual))).toEqual(expected)
	}))
})

test('Unrecognized', async ({ expect }) => {
	const fixture = 'unrecognized'
	const [fileName] = await readdir(join(root, fixture))
	const inputPath = join(root, fixture, fileName)
	const file = await readFile(inputPath, 'utf-8')
	const feed = parse(file)
	expect(feed).toBeNull()
})

test.skip('throws useful errors', ({ expect }) => {
	expect.fail()
})
