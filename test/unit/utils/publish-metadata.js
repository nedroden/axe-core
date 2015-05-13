/*global dqreConfiguration */

describe('utils.publishMetaData', function () {
	'use strict';

	afterEach(function () {
		dqre._audit = null;
	});

	it('should be a function', function () {
		assert.isFunction(utils.publishMetaData);
	});

	it('should pull data from rules from dqreConfiguration.data', function () {
		var expected = {
			foo: 'bar',
			bob: 'loblaw'
		};

		dqre._load({
			rules: [],
			data: {
				rules: {
					cats: expected
				}
			}
		});

		var result = {
			id: 'cats',
			nodes: []
		};
		utils.publishMetaData(result);

		assert.equal(result.foo, expected.foo);
		assert.equal(result.bob, expected.bob);
	});

	it('should pull data from checks from dqreConfiguration.data', function () {
		var expected = {
			foo: 'bar',
			bob: 'loblaw'
		};

		dqre._load({
			rules: [],
			data: {
				checks: {
					cats: expected
				}
			}
		});

		var result = {
			id: 'foo',
			nodes: [{
				any: [{
					id: 'cats'
				}],
				all: [],
				none: []
			}]
		};
		utils.publishMetaData(result);
		assert.equal(result.nodes[0].any[0].foo, expected.foo);
		assert.equal(result.nodes[0].any[0].bar, expected.bar);
	});


	it('should execute failureMessage', function () {

		dqre._load({
			rules: [],
			data: {
				rules: {
					cats: {
						help: function () {
							return 'cats-rule';
						}
					}
				},
				checks: {
					'cats-NONE': {
						failureMessage: function () {
							return 'cats-NONE';
						}
					},
					'cats-ANY': {
						failureMessage: function () {
							return 'cats-ANY';
						}
					},
					'cats-ALL': {
						failureMessage: function () {
							return 'cats-ALL';
						}
					}
				}
			}
		});

		var result = {
			id: 'cats',
			nodes: [{
				any: [{
					result: false,
					id: 'cats-ANY'
				}],
				none: [{
					result: true,
					id: 'cats-NONE'
				}],
				all: [{
					result: false,
					id: 'cats-ALL'
				}]
			}]
		};
		utils.publishMetaData(result);
		assert.deepEqual(result, {
			id: 'cats',
			help: 'cats-rule',
			tags: [],
			nodes: [{
				any: [{
					result: false,
					id: 'cats-ANY',
					failureMessage: 'cats-ANY'
				}],
				none: [{
					result: true,
					id: 'cats-NONE',
					failureMessage: 'cats-NONE'
				}],
				all: [{
					result: false,
					id: 'cats-ALL',
					failureMessage: 'cats-ALL'
				}]
			}]
		});

	});

	it('should set failureMessage to null if check is passing', function () {

		dqre._load({
			rules: [],
			data: {
				rules: {
					cats: {
						help: function () {
							return 'cats-rule';
						}
					}
				},
				checks: {
					'cats-NONE': {
						failureMessage: function () {
							return 'cats-NONE';
						}
					},
					'cats-ANY': {
						failureMessage: function () {
							return 'cats-ANY';
						}
					},
					'cats-ALL': {
						failureMessage: function () {
							return 'cats-ALL';
						}
					}
				}
			}
		});

		var result = {
			id: 'cats',
			nodes: [{
				any: [{
					result: true,
					id: 'cats-ANY'
				}],
				none: [{
					result: false,
					id: 'cats-NONE'
				}],
				all: [{
					result: true,
					id: 'cats-ALL'
				}]
			}]
		};
		utils.publishMetaData(result);
		assert.deepEqual(result, {
			id: 'cats',
			help: 'cats-rule',
			tags: [],
			nodes: [{
				any: [{
					result: true,
					id: 'cats-ANY',
					failureMessage: null
				}],
				none: [{
					result: false,
					id: 'cats-NONE',
					failureMessage: null
				}],
				all: [{
					result: true,
					id: 'cats-ALL',
					failureMessage: null
				}]
			}]
		});


	});


	it('should not modify base configuration', function () {
		dqre._load({
			rules: [],
			data: {
				rules: {
					cats: {
						help: function () {
							return 'cats-rule';
						}
					}
				},
				checks: {
					'cats-PASS': {
						failureMessage: function () {
							return 'cats-check';
						}
					},
					'cats-ANY': {
						failureMessage: function () {
							return 'cats-check2';
						}
					},
					'cats-ALL': {
						failureMessage: function () {
							return 'cats-check2';
						}
					}
				}
			}
		});
		utils.publishMetaData({
			id: 'cats',
			nodes: [{
				any: [{
					result: false,
					id: 'cats-PASS'
				}],
				none: [{
					result: true,
					id: 'cats-FAIL'
				}],
				all: [{
					result: false,
					id: 'cats-ALL'
				}]
			}]
		});

		assert.isNotNull(dqreConfiguration.data.checks['cats-PASS'].failureMessage);
		assert.isNotNull(dqreConfiguration.data.checks['cats-ANY'].failureMessage);
		assert.isNotNull(dqreConfiguration.data.checks['cats-ALL'].failureMessage);

	});

	it('should pull tags off rule object', function () {
		var expected = {
			foo: 'bar',
			bob: 'loblaw'
		};

		dqre._load({
			rules: [{
				id: 'foo',
				tags: ['hai']
			}],
			data: {
				checks: {
					cats: expected
				}
			}
		});

		var result = {
			id: 'foo',
			nodes: [{
				any: [{
					id: 'cats'
				}],
				all: [],
				none: []
			}]
		};
		utils.publishMetaData(result);
		assert.deepEqual(result.tags, ['hai']);

	});

});
