// Node.js libs
var path = require('path');
var fs = require('fs-extra');
var assert = require('assert');
// Gulp libs
var gutil = require('gulp-util');
// Module
var dirSync = require('../');

// Recursively read a directory
var recurseReadDir = function (root, files, prefix) {
	prefix = prefix || '';
	files = files || [];

	var dir = path.join(root, prefix);
	if (!fs.existsSync(dir)) {
		return files;
	}
	if (fs.statSync(dir).isDirectory()) {
		fs.readdirSync(dir).forEach(function (name) {
			recurseReadDir(root, files, path.join(prefix, name));
		});
	} else {
		files.push(prefix);
	}

	return files;
};

// Creating test files
var createFiles = function (filepath, count) {
	fs.ensureDirSync(filepath);
	for (var i = 0; i < count; i++) {
		var testFile = path.join(filepath, 'test-' + i + '.txt');
		fs.writeFileSync(testFile, 'test');
	}
};

describe('Default task', function () {
	it('Copying files', function () {
		dirSync('test/fixtures/', '.tmp/copy/').end();
		var result = recurseReadDir('.tmp/copy/');
		assert.equal(result.length, 8);
	});

	it('Removing files', function () {
		createFiles('.tmp/remove/', 3);
		dirSync('test/fixtures/', '.tmp/remove/').end();
		var result = recurseReadDir('.tmp/remove/');
		assert.equal(result.length, 8);
	});

	it('Skipping files', function () {
		dirSync('test/fixtures/', '.tmp/copy/').end();
		dirSync('test/fixtures/', '.tmp/copy/').end();
		var result = recurseReadDir('.tmp/copy/');
		assert.equal(result.length, 8);
	});
});

describe('Updating files', function () {
	it('Remove file in `dest`', function () {
		dirSync('test/fixtures/', '.tmp/update_dest/').end();

		// Remove one file in the destination directory
		fs.removeSync('.tmp/update_dest/folder-1/test.txt');
		dirSync('test/fixtures/', '.tmp/update_dest/').end();
		var result = recurseReadDir('.tmp/update_dest/');
		assert.equal(result.length, 8);
	});

	it('Remove file in `src`', function () {
		// Backup test files
		fs.copySync('test/fixtures/', '.tmp/fixtures_backup/');
		dirSync('.tmp/fixtures_backup/', '.tmp/update_src/').end();

		// Remove one file in the source directory
		fs.removeSync('.tmp/fixtures_backup/folder-1/test.txt');
		dirSync('.tmp/fixtures_backup/', '.tmp/update_src/').end();
		var result = recurseReadDir('.tmp/update_src/');
		assert.equal(result.length, 7);
	});

	it('Update with only copies (nodelete)', function () {
		createFiles('.tmp/update_nodelete/', 3);
		dirSync('test/fixtures/', '.tmp/update_nodelete/', {
			nodelete: true
		}).end();
		var result = recurseReadDir('.tmp/update_nodelete/');
		// File `test-2.txt` overwritten
		assert.equal(result.length, 10);
	});
});

describe('Output statistics (printSummary)', function () {
	it('Boolean', function () {
		// Hook for console output
		var stdout = 0;
		gutil.log = function () {
			stdout += JSON.stringify(arguments);
		};

		dirSync('test/fixtures/', '.tmp/print_boolean/', {
			printSummary: true
		}).end();

		assert.equal(/8 files created/.test(stdout), true);
	});

	it('Function', function () {
		// Hook for console output
		var stdout = 0;
		gutil.log = function () {
			stdout += JSON.stringify(arguments);
		};

		dirSync('test/fixtures/', '.tmp/print_function/', {
			printSummary: function (stat) {
				gutil.log('created:' + stat.created);
			}
		}).end();

		assert.equal(/created:8/.test(stdout), true);
	});
});

describe('Ignoring files (ignore)', function () {
	it('String', function () {
		dirSync('test/fixtures/', '.tmp/ignore_string/', {
			ignore: 'folder-1'
		}).end();
		var result = recurseReadDir('.tmp/ignore_string/');
		assert.equal(result.length, 4);
	});

	it('Regex', function () {
		dirSync('test/fixtures/', '.tmp/ignore_regex/', {
			ignore: /^folder-1$/i
		}).end();
		var result = recurseReadDir('.tmp/ignore_regex/');
		assert.equal(result.length, 4);
	});

	it('Array', function () {
		dirSync('test/fixtures/', '.tmp/ignore_array/', {
			ignore: [
				'folder-1',
				'test-2.txt'
			]
		}).end();
		var result = recurseReadDir('.tmp/ignore_array/');
		assert.equal(result.length, 2);
	});

	it('Function', function () {
		dirSync('test/fixtures/', '.tmp/ignore_function/', {
			ignore: function (dir, file) {
				var fullPath = path.join(dir, file).replace(/\\/g, '/');
				return Boolean(fullPath.indexOf('folder-1/test.txt') + 1);
			}
		}).end();
		var result = recurseReadDir('.tmp/ignore_function/');
		assert.equal(result.length, 7);
	});
});
