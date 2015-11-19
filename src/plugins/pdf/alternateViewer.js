'use strict';

var React = require('react'),
	GenericViewer = require('../generic/viewer.js');

var AlternativeViewer = React.createClass({
	componentDidMount: function() {
		this.updateProgress(100);
	},
	updateProgress: function(progress) {
		if (this.props.progressCallback) {
			this.props.progressCallback(progress);
		}
	},
	render: function() {
		//TODO: Pdf.js!
		return <object
			data={this.props.src}
			type="application/pdf"
			className="vui-fileviewer-pdf-alternate">
			<GenericViewer {...this.props} />
		</object>;
	}
});

module.exports = AlternativeViewer;
