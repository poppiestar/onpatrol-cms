'use strict';

var expect = require('chai').expect,
    slugHelper = require('../lib/helpers/slughelper');

describe('SlugHelper', function() {

  describe('slug parser', function() {

    it('returns an empty slug object when given an empty slug', function() {
      var expectedObject = { title: '', category: '' };
      
      expect(slugHelper.parse('')).to.deep.equal(expectedObject);
    });

    it('returns an object with the title when no category is in the slug', function() {
      var expectedObject = { title: 'testing', category: '' };

      expect(slugHelper.parse('testing')).to.deep.equal(expectedObject);
    });

    it('returns an object with a title and category when they are in the slug', function() {
      var expectedObject = { title: 'testing', category: 'cat' };

      expect(slugHelper.parse('cat/testing')).to.deep.equal(expectedObject);
    });

  });

});

