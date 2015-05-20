var path        = require('path');
var cacheHelper = require('documark-cache');
var jade        = require('jade');
var validUrl    = require('valid-url');
var tinyRange   = require('tiny-range');

function wrap (data, file) {
	return jade.renderFile(path.join(__dirname, file), data);
}

function shouldSkipFunction (selector) {
	var range, i, val;

	// Always show
	if ( ! selector) {
		return 'function () { return false; }';
	}

	// Parse range
	try {
		range = ('' + selector).replace(/~/g, '').replace(/-/g, '~');
		range = tinyRange.parse(range);
	} catch (ex) {
		throw new Error('Invalid range string for skipHeaderOn/skipFooterOn: ' + selector);
	}

	for (i = 0; i < range.length; ++i) {
		val = range[i];
		if ( ! Array.isArray(val)) {
			range[i] = [val, val];
		}
	}

	// Function to test for page skip
	return 'function (page) {' +
			'var range = ' + JSON.stringify(range) + ', i;' +
			'page = parseInt(page, 10);' +
			'for (i = 0; i < range.length; ++i) {' +
				'if (page >= range[i][0] && page <= range[i][1]) { return true; }' +
			'}' +
			'return false;' +
		'}';
}

module.exports = function dmpPageMeta ($, document, done) {
	var config    = document.config();
	var options   = config.pdf;
	var cache     = cacheHelper(document);
	var $header   = $('header');
	var hasHeader = ($header.length > 0);
	var $footer   = $('footer');
	var hasFooter = ($footer.length > 0);
	var data, file;

	// Page options
	options.encoding     = options.encoding     || 'UTF-8';
	options.pageSize     = options.pageSize     || 'A4';
	options.marginTop    = options.marginTop    || (hasHeader ? '30mm' : '20mm');
	options.marginBottom = options.marginBottom || (hasFooter ? '30mm' : '20mm');
	options.marginLeft   = options.marginLeft   || '20mm';
	options.marginRight  = options.marginRight  || '20mm';

	// Add header/footer
	if (hasHeader) {
		file = cache.fileWriteStream('header.html');
		data = {
			body: $.html($header),
			config: config,
			'$el': $header,
			header: true,
			skipOnPage: shouldSkipFunction(config.hideHeaderOn),
		};
		file.end(wrap(data, 'assets/wrapper-header-footer.jade'));
		options.headerHtml = 'file://' + file.path;
		$header.remove();
	}
	if (hasFooter) {
		file = cache.fileWriteStream('footer.html');
		data = {
			body: $.html($footer),
			config: config,
			'$el': $footer,
			footer: true,
			skipOnPage: shouldSkipFunction(config.hideFooterOn),
		};
		file.end(wrap(data, 'assets/wrapper-header-footer.jade'));
		options.footerHtml = 'file://' + file.path;
		$footer.remove();
	}

	// Globalize stylesheets
	var stylesheets = (Array.isArray(config.stylesheets) ? config.stylesheets : []);

	if (options.userStyleSheet) {
		stylesheets = [options.userStyleSheet.replace(/^file:\/\//, '')].concat(stylesheets);
	}

	$('link[type="text/css"][href]').each(function () {
		var $this = $(this);
		stylesheets.push($this.attr('href'));
		$this.remove();
	});

	if (stylesheets.length) {
		var stylesheetsFile = cache.fileWriteStream('styles.css');
		var imports         = '';

		stylesheets.forEach(function (file) {
			var url = (validUrl.isUri(file) ? file : 'file://' + path.resolve(file));
			imports += '@import url("' + url + '");\n';
		});

		options.userStyleSheet = stylesheetsFile.path;
		stylesheetsFile.end(imports);
	}

	done();
};
