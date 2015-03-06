var path        = require('path');
var cacheHelper = require('documark-cache');
var jade        = require('jade');
var validUrl    = require('valid-url');

function wrap (data, file) {
	if (typeof data !== 'object') {
		data = { body: data };
	}
	return jade.renderFile(path.join(__dirname, file), data);
}

module.exports = function dmpPageMeta ($, document, done) {
	var config    = document.config();
	var options   = config.pdf;
	var cache     = cacheHelper(document);
	var $header   = $('header');
	var hasHeader = ($header.length > 0);
	var $footer   = $('footer');
	var hasFooter = ($footer.length > 0);

	// Page options
	options.encoding     = options.encoding     || 'UTF-8';
	options.pageSize     = options.pageSize     || 'A4';
	options.marginTop    = options.marginTop    || (hasHeader ? '30mm' : '20mm');
	options.marginBottom = options.marginBottom || (hasFooter ? '30mm' : '20mm');
	options.marginLeft   = options.marginLeft   || '20mm';
	options.marginRight  = options.marginRight  || '20mm';

	// Add header/footer
	if (hasHeader) {
		var headerFile = cache.fileWriteStream('header.html');
		headerFile.end(wrap($.html($header), 'assets/wrapper-header-footer.jade'));
		options.headerHtml = 'file://' + headerFile.path;
		$header.remove();
	}
	if (hasFooter) {
		var footerFile = cache.fileWriteStream('footer.html');
		footerFile.end(wrap($.html($footer), 'assets/wrapper-header-footer.jade'));
		options.footerHtml = 'file://' + footerFile.path;
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
