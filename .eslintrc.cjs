module.exports = {
	root: true,
	env: {
		browser: true,
		node: true,
	},
	extends: '@antfu',
	rules: {
		'no-tabs': 0,
		'@typescript-eslint/indent': ['error', 'tab'],
		'jsonc/indent': ['error', 'tab'],
	},
}
