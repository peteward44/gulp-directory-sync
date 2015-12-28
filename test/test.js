var fs = require('fs');
var exec = require('child_process').exec;
var test = require('ava');
var directorySync = require('../');

test.cb('default options', function( t ) {
	exec('npm run test-default', function( err ) {
		if ( err ) {
			t.fail( err );
		}

		var isTestTxt = fs.statSync( '../.tmp/default/test.txt' ).isFile();
		var isOneTxt = fs.statSync( '../.tmp/default/one/one.txt' ).isFile();
		var isTwoTxt = fs.statSync( '../.tmp/default/two/two.txt' ).isFile();

		t.is( isTestTxt && isOneTxt && isTwoTxt, true );
		t.end();
	});
});

test.cb('printSummary option', function( t ) {
	exec('npm run test-print', function( err, stdout ) {
		if ( err ) {
			t.fail( err );
		}

		var isPrint = /Dir Sync: 4 files created/.test( stdout );

		t.is( isPrint, true );
		t.end();
	});
});

test.cb('ignore option', function( t ) {
	exec('npm run test-ignore', function( err ) {
		if ( err ) {
			t.fail( err );
		}

		var isTestTxt;
		var isOneTxt = fs.statSync( '../.tmp/ignore/one/one.txt' ).isFile();
		var isTwoTxt = fs.statSync( '../.tmp/ignore/two/two.txt' ).isFile();

		try {
			isTestTxt = fs.statSync( '../.tmp/ignore/test.txt' );
		} catch ( e ) {
			isTestTxt = ( e.code === 'ENOENT' );
		}

		t.is( isTestTxt && isOneTxt && isTwoTxt, true );
		t.end();
	});
});
