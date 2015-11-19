'use strict';

jest.dontMock('../alternate.js');

var alternate = require('../alternate.js');

describe('PDF Alternate Plugin', function() {

	it('does not handle non-PDF files', function() {
		var result = alternate.test('foo/bar');
		expect(result).toBeFalsy();
	});

	it('does handle PDF files', function() {
		var result = alternate.test('application/pdf');
		expect(result).toBeTruthy();
	});

	it('returns a viewer', function() {
		var viewer = alternate.getComponent();
		expect(viewer).toBeDefined();
	});

});
