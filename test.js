import fs from 'node:fs'
import path from 'node:path'
import test from 'tape'

const root = path.join('./fixtures')

test('Fixtures', (t) => {
	fs.readdirSync(root).forEach(async (fixture) => {
		const inputPath = path.join(root, fixture, 'input.txt')
		const outputPath = path.join(root, fixture, 'output.json')
		const file = fs.readFileSync(inputPath, 'utf-8')
		const actual = ''

		let expected
		try {
			expected = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
		}
		catch (error) {
			fs.writeFileSync(outputPath, `${JSON.stringify(actual, null, 2)}\n`)
			return
		}

		t.deepLooseEqual(actual, expected, `should work on ${fixture}`)
	})

	t.end()
})

test('throws useful errors', (t) => {
	t.end()
})
