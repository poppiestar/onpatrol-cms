'use strict';

var expect = require('chai').expect,
    urlHelper = require('../lib/helpers/urlhelper');

describe('URL Helper', function() {

  describe('URL parser', function() {

    it('returns an empty URL object when given an empty URL', function() {
      var expectedObject = { title: 'root', category: 'root' };
      
      expect(urlHelper.parse('/')).to.deep.equal(expectedObject);
    });

    it('returns an object with the category when no title is in the URL', function() {
      var expectedObject = { title: 'root', category: 'testing' };

      expect(urlHelper.parse('/testing')).to.deep.equal(expectedObject);
    });

    it('returns an object with the category when URL ends in a slash', function() {
      var expectedObject = { title: 'root', category: 'testing' };

      expect(urlHelper.parse('/testing/')).to.deep.equal(expectedObject);
    });

    it('returns an object with a title and category when they are in the URL', function() {
      var expectedObject = { title: 'testing', category: 'cat' };

      expect(urlHelper.parse('/cat/testing')).to.deep.equal(expectedObject);
    });

    it('returns an object with a title and category when URL ends in a slash', function() {
      var expectedObject = { title: 'testing', category: 'cat' };

      expect(urlHelper.parse('/cat/testing/')).to.deep.equal(expectedObject);
    });

  });

});

