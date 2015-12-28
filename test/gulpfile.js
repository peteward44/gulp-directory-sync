var gulp = require('gulp');
var dirSync = require('../');

gulp.task('default', function() {
	return gulp.src('')
		.pipe(dirSync('./fixtures', '../.tmp/default'));
});

gulp.task('print', function() {
	return gulp.src('')
		.pipe(dirSync('./fixtures', '../.tmp/print', { printSummary: true }));
});

gulp.task('ignore', function() {
	return gulp.src('')
		.pipe(dirSync('./fixtures', '../.tmp/ignore', { ignore: 'test.txt' }));
});
