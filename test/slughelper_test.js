'use strict';

var expect = require('chai').expect,
    slugHelper = require('../lib/helpers/slughelper');

describe('SlugHelper', function() {

  describe('slug parser', function() {

    it('returns an empty slug object when given an empty slug', function() {
      var expectedObject = { title: '', category: '' };
      
      expect(slugHelper.parse('')).to.deep.equal(expectedObject);
    });

  });

});

