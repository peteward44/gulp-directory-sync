# gulp-directory-sync
A gulp plugin to sync 2 directories which actually works

```
npm install gulp-directory-sync --save-dev
```

```
var dirSync = require( 'gulp-directory-sync' );

gulp.task( 'sync', function() {
	return gulp.src( '' )
		.pipe(dirSync( 'my_source_dir', 'my_dest_dir', { printSummary: true } ))
		.on('error', gutil.log);
} );
```

Supports the following options in the 3rd parameter:

	- printSummary : (Boolean) Prints to console what has changed - (Function) Allows custom result logging
```
	dirSync( 'my_source_dir', 'my_dest_dir', { printSummary: true } ) // outputs default message
	dirSync( 'my_source_dir', 'my_dest_dir', {
		printSummary: function( result ) {
			gutil.log( 'Dir Sync: ' + result.created + ' files created, ' + result.updated + ' files updated, ' + result.removed + ' items deleted, ' + result.same + ' files unchanged' );
		}
	} )
```

	- nodelete : Doesn't delete files from the dst folder, only copies
	- ignore : Either a string, regex, or function to determine if a file should be processed. eg.
	
```
	dirSync( 'my_source_dir', 'my_dest_dir', { ignore: /^\.svn$/i } ) // regex ignoring all .svn folders
	dirSync( 'my_source_dir', 'my_dest_dir', { ignore: function( dir, file ) { return file === '.svn'; } } ) // function ignoring all .svn folders
	dirSync( 'my_source_dir', 'my_dest_dir', { ignore: '.svn' } } ) // string ignoring all .svn folders
	dirSync( 'my_source_dir', 'my_dest_dir', { ignore: [ /^\.svn$/i, '.git' ] } } ) // use an array to specify multiple filters
```
