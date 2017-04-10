'use strict';

var React = require('react'),
	FileViewerResolved = require('./fileViewerResolved'),
	fileInfoProvider = require('./fileInfoProvider'),
	i18n = require('react-frau-intl').i18n,
	getMessages = require('./getMessages'),
	IntlFileViewer = i18n(FileViewerResolved),
	getFilename = require('./getFilename');

var FileViewer = React.createClass({
	propTypes: {
		src: React.PropTypes.string.isRequired,
		pdf: React.PropTypes.string,
		locale: React.PropTypes.string,
		progressCallback: React.PropTypes.func,
		resizeCallback: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			info: null,
			canAccessFile: null
		};
	},

	componentDidMount: function() {
		this.fetchFileInfo(this.props.src);
	},

	componentWillReceiveProps: function(nextProps) {
		if (nextProps.src !== this.props.src) {
			this.setState({info:null, canAccessFile: null});
			this.fetchFileInfo(nextProps.src);
		}
	},

	fetchFileInfo: function( src ) {
		if (!this.isMounted()) {
			return;
		}
		if ( this.props.pdf ) {
			this.setState( {
				canAccessFile: true,
				info: {
					size: 0,
					mimeType: 'application/pdf',
					filename: getFilename( this.props.pdf )
				}
			});
		} else {
			fileInfoProvider(src, function(err, fileInfo) {
				if (err) {
					this.setState({canAccessFile: false, info: null});
					return;
				}
				this.setState({canAccessFile: true, info: fileInfo});
			}.bind(this));
		}
	},

	render: function() {
		var forceGeneric = this.state.canAccessFile === false;

		if (!forceGeneric && !this.state.info) {
			return null;
		}

		var messages = getMessages(this.props.locale);
		var mimeType = (forceGeneric) ? undefined : this.state.info.mimeType;

		return <IntlFileViewer
			{...this.props}
			messages={messages}
			mimeType={mimeType}
		/>;
	}
});

module.exports = FileViewer;
