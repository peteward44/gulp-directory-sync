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

