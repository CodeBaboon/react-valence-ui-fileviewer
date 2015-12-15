'use strict';

var React = require('react'),
	pdfjs = require('./pdfjs-lib'),
	AlternateViewerPage = require('./alternateViewerPage'),
	isInView = require('./isInView'),
	getPixelRatio = require('./pixelRatio/getPixelRatio');

var MAX_SCALE = 1.5;

var AlternativeViewer = React.createClass({
	propTypes: {
		src: React.PropTypes.string.isRequired,
		progressCallback: React.PropTypes.func,
		maxScale: React.PropTypes.number
	},
	getMaxScale: function() {
		return this.props.maxScale || MAX_SCALE;
	},
	onDocumentLoaded: function(pdf) {
		if (!pdf || !this.isMounted()) {
			return;
		}

		var self = this;

		self.updateProgress(70);

		pdf.getPage(1).then(function(page) {
			var unscaledViewport = page.getViewport(1),
				containerNode = React.findDOMNode(self),
				scale = Math.min(self.getMaxScale(), (containerNode.clientWidth - 20) / unscaledViewport.width),
				pageViewport = page.getViewport(scale),
				pages = [];

			for (var i = 1; i <= pdf.numPages; i++) {
				pages.push({
					pageNumber: i,
					pdfPage: i === 1 ? page : null,
					ref: 'page_' + i,
					requested: i === 1
				});
			}

			self.setState({
				pdf: pdf,
				pageHeight: pageViewport.height,
				pageWidth: pageViewport.width,
				pages: pages,
				scale: scale
			});

			self.loadVisiblePages();

			self.updateProgress(100);
		});
	},
	loadPage: function(pageNumber) {
		var self = this;
		this.state.pdf.getPage(pageNumber).then(function(newPage) {
			var page = self.state.pages[pageNumber - 1];
			page.pdfPage = newPage;

			self.forceUpdate();
		});
	},
	onScroll: function() {
		this.loadVisiblePages();
	},
	loadVisiblePages: function() {
		var self = this,
			scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
			visibleAreaHeight = window.innerHeight;

		this.state.pages.forEach(function(page) {
			var pageDOMNode = self.refs[page.ref].getDOMNode();

			if (!page.requested && isInView(pageDOMNode, scrollPosition, visibleAreaHeight))
			{
				page.requested = true;
				self.loadPage(page.pageNumber);
			}
		});
	},
	componentDidMount: function() {
		this.updateProgress(10);
		document.addEventListener('scroll', this.onScroll);

		var url = this.props.src;
		pdfjs.getDocument({
			url: url,
			withCredentials: true
		}).then(this.onDocumentLoaded);
	},
	componentWillUnmount: function() {
		document.removeEventListener('scroll', this.onScroll);
	},
	updateProgress: function(progress) {
		if (this.props.progressCallback) {
			this.props.progressCallback(progress, 'guess');
		}
	},
	getInitialState: function() {
		return {
			pages: [],
			pixelRatio: getPixelRatio(),
			scale: 1
		};
	},
	render: function() {
		var self = this;
		return (
			<div className="vui-fileviewer-pdf-alternate">
				{self.state.pages.map(function(page) {
					return <AlternateViewerPage key={page.ref} ref={page.ref}
						page={page}
						pixelRatio={self.state.pixelRatio}
						scale={self.state.scale}
						pageHeight={self.state.pageHeight}
						pageWidth={self.state.pageWidth} />;
				})}
			</div>
		);
	}
});

module.exports = AlternativeViewer;