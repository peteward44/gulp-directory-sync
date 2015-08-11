/*jslint node: true */
'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs-extra');
var crc = require('crc');
var path = require('path');

var PLUGIN_NAME = 'directory-sync';
var created = 0, removed = 0, updated = 0, same = 0;

	
var areTheSame = function( src, dst ) {
	var s = crc.crc32(fs.readFileSync(src)).toString(16);
	var d = crc.crc32(fs.readFileSync(dst)).toString(16);
	return s === d;
};


var isIgnored = function( options, file ) {
	if ( options.ignore ) {
		var t = typeof options.ignore;
		if ( t === 'function' ) {
			return options.ignore( file );
		} else if ( t === 'string' ) {
			// comma separated filenames
			return options.ignore.split( ',' ).some( function( file ) {
				return file === t;
			} );
		} else {
			// regular expression
			var matches = options.ignore.exec( file );
			return matches && matches.length > 0;
		}
	}
	return false;
};


var remove = function( options, src, dst ) {

	var leaves = fs.readdirSync( dst );
	leaves.forEach( function( leaf ) {
		if ( isIgnored( options, leaf ) ) {
			return;
		}
		var fullSrc = path.join( src, leaf );
		var fullDst = path.join( dst, leaf );
		if ( !fs.existsSync( fullSrc ) ) {
			// exists in dst but not src - delete it
			fs.deleteSync( fullDst );
			removed++;
		} else {
			var statSrc = fs.statSync( fullSrc );
			var statDst = fs.statSync( fullDst );
			if ( statSrc.isFile() !== statDst.isFile() || statSrc.isDirectory() !== statDst.isDirectory() ) {
				fs.deleteSync( fullDst ); // make sure they are the same type, else delete it
			} else if ( statDst.isDirectory() ) {
				remove( options, fullSrc, fullDst );
			}
		}
	} );
};


var create = function( options, src, dst ) {

	var leaves = fs.readdirSync( src );
	leaves.forEach( function( leaf ) {
		if ( isIgnored( options, leaf ) ) {
			return;
		}
		var fullSrc = path.join( src, leaf );
		var fullDst = path.join( dst, leaf );
		var existsDst = fs.existsSync( fullDst ); 
		var statSrc = fs.statSync( fullSrc );
		if ( statSrc.isFile() ) {
			if ( existsDst ) {
				var statDst = fs.statSync( fullDst );
				if ( statDst.isDirectory() ) {
					// directory exists with same name as the file - delete it and copy
					fs.deleteSync( fullDst );
					fs.copySync( fullSrc, fullDst, { force: true } );
					updated++;
				} else if ( statDst.isFile() ) {
					// both files exist - check checksums to make sure they're the same
					if ( !areTheSame( fullSrc, fullDst ) ) {
						fs.copySync( fullSrc, fullDst, { force: true } );
						updated++;
					} else {
						same++;
					}
				}
			} else {
				// exists in src but not dst - copy file over
				fs.copySync( fullSrc, fullDst, { force: true } );
				created++;
			}
		} else if ( statSrc.isDirectory() ) {
			if ( !existsDst ) {
				fs.mkdirsSync( fullDst );
			}
			create( options, fullSrc, fullDst );
		}
	} );
};


var dirSync = function(src, dst, options) {
	options = options || {};

	var func = function(callback) {		
		if ( !src || !dst ) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Invalid parameter'));
			callback();
			return;
		}
		created = removed = updated = same = 0;
		
		fs.ensureDirSync( dst );
		remove( options, src, dst );
		create( options, src, dst );
		
		if ( options.printSummary ) {
			gutil.log( 'Dir Sync: ' + created + ' files created, ' + updated + ' files updated, ' + removed + ' items deleted, ' + same + ' files unchanged' );
		}
		callback();
	};

	return through.obj(
		function( file, enc, callback ) {
			this.push( file );
			callback();
		},
		func
	);
};


module.exports = dirSync;
