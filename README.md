# Documark Page Meta

[![npm version](https://badge.fury.io/js/dmp-page-meta.svg)](http://badge.fury.io/js/dmp-page-meta)
[![dependency status](https://david-dm.org/documark/dmp-page-meta.svg)](https://david-dm.org/documark/dmp-page-meta)

> Documark plugin for configuring the header, footer, page margins, and global styles.

This plugin wraps the content with a `doctype`, `html`, and `body` element.
And sets the charset to `UTF-8` in the `head` element.

## Usage

1. Add plugin to document configuration:

	```yaml
	plugins:
	  - dmp-page-meta
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

## Configuration

These options can be added to your [document configuration][document-configuration].

Use the following options to remove the header/footer for certain pages:

```yaml
hideHeaderOn: 1
hideFooterOn: 1, 3-4, 9-
```

Use `startPageCountOn` to shift the displayed page numbers:

```yaml
startPageCountOn:  2  # to start counting from page number 2
startPageCountOn: -3  # to skip first four pages, page 5 will now be numbered 1
```

Let's say you want to skip the first four pages from numbering and hide their headers and footers. You can use this (slightly counterintuitive) configuration for that:

```yaml
startPageCountOn: -3  # 1 - 4 (number of pages to skip) = -3
hideHeaderOn: -3-0
hideFooterOn: -3-0
```

[document-configuration]: https://github.com/documark/documark#configuration
