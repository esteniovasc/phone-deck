/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			cursor: {
				'pd-default': 'url(/cursors/default.svg) 0 0, auto',
				'pd-pointer': 'url(/cursors/pointer.svg) 6 0, pointer',
				'pd-text': 'url(/cursors/text.svg) 12 12, text',
				'pd-grab': 'url(/cursors/grab.svg) 12 12, grab',
				'pd-grabbing': 'url(/cursors/grabbing.svg) 12 12, grabbing',
			},
		},
	},
	plugins: [],
}
