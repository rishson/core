import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import has from 'src/has';
import * as text from 'src/text';
import { stub } from 'sinon';
import 'intern/dojo/has!host-node?./text_node:./text_browser';
import { RootRequire } from 'src/loader';

declare const require: RootRequire;

// The exported get function from the text module
// uses fs.readFile on node systems, which resolves
// paths differently than request, which can and
// should be used internally for browser environments.
// As such, this determines the appropriate base path
// for get tests.
const basePath = (function() {
	if (has('host-browser')) {
		return '../../_build/tests/support/data/';
	}
	else if (has('host-node')) {
		return '_build/tests/support/data/';
	}
})();
const absPathMock = (val: string) => val;

registerSuite({
		name: 'text',

		'get'(this: any) {
			text.get(basePath + 'correctText.txt').then(this.async().callback(function (text: string) {
				assert.strictEqual(text, 'abc');
			}));
		},

		'normalize': {
			'calls absMid function for relative path'() {
				const absMidStub = stub().returns('test');
				text.normalize('./test', absMidStub);
				assert.isTrue(absMidStub.calledOnce, 'Abs mid function should be called');
			},
			'does not call absMid function for abs path'() {
				const absMidStub = stub().returns('test');
				text.normalize('test', absMidStub);
				assert.isFalse(absMidStub.called, 'Abs mid function should not be called');
			},
			'should return passed strip flag for relative path'() {
				const normalized = text.normalize('./test!strip', absPathMock);
				assert.include(normalized, '!strip', 'Strip flag should be present');
			},
			'should return passed strip flag for abs path'() {
				const normalized = text.normalize('test!strip', absPathMock);
				assert.include(normalized, '!strip', 'Strip flag should be present');
			}
		},
		'load': {
			'should strip xml'(this: any) {
				text.load(basePath + 'strip.xml!strip', require, this.async().callback((val: string) => {
					assert.strictEqual(val, 'abc', 'Should have stripped the XML');
				}));
			},
			'should strip html'(this: any) {
				text.load(basePath + 'strip.html!strip', require, this.async().callback((val: string) => {
					assert.strictEqual(val, 'abc', 'Should have stripped the XML');
				}));
			}
		}
	}
);
