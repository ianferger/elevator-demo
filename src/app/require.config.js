// require.js looks for the following global when initializing
// require.js looks for the following global when initializing
var require = {
	baseUrl: ".",
	map: {
		'*': {
			"css": "bower_modules/require-css/css" // or whatever the path to require-css is
		}
	},
	paths: {
		"knockout":             "bower_modules/knockout/dist/knockout",
		"text":					"bower_modules/requirejs-text/text",
		"html":					"bower_modules/requirejs-html/html",
		"Logger":				"bower_modules/js-logger/src/logger.min",
		"audio5":				"bower_modules/audio5js/audio5.min",
		"utils":				"lib/utils",

		/* elevator-panel app modules*/
		"ep-media-queries":		"css/elevator-panel-media-queries",
		"ep-styles":			"css/elevator-panel-styles",
		"ep-animations":		"css/elevator-panel-animations",
		"ep-component":			"components/elevator-panel-component",
		"ep-controller":		"controllers/elevator-panel-controller",
		"ep-view-model":		"viewModels/elevator-panel-view-model",
		/* elevator-panel html templates */
		"ep-template":			"templates/elevator-panel-template",
		"ep-intro":				"templates/elevator-panel-intro",
		"ep-ios-error":			"templates/elevator-panel-error-ios",
	},
	

	shim: {
		"ep-controller": { deps: ["utils", "audio5", "Logger"] },

		"ep-component":
			{ deps: ["ep-controller", "ep-view-model", "Logger"] }
	}
};