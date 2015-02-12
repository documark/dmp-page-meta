# Documark Page Meta

Documark plugin for configuring the header, footer, page margins, and global styles.

### Usage

1. Add plugin to document configuration:

	```yaml
	plugins:
	  - documark-page-meta
	```

2. Add header and footer content with:

	```jade
	header
		.pull-left Header left.
		.pull-right Header right.
		center Header center.
		.clearfix

	footer
		.pull-left.section
		.pull-right= 'Page '
			span.page-number
			= ' of '
			span.page-count
		.clearfix
	```

3. Optionally add global stylesheets to the front-matter:

	```yaml
	stylesheets:
	  - assets/css/style.css
	```

	Note that headers, footers, and things like landscape pages are compiled 'separately'. WkHTMLToPDF allows for combining multiple HTML files into one PDF. So these __'global stylesheets'__ refer to styles that also apply to the entire document.

__Note:__ This plugin globalizes all stylesheets (including the `<link type="text/css" href="..." />` elements).
