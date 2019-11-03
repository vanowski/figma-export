import * as gulp from 'gulp';
import exportAssets from './exportAssets';

gulp.task('variables', async () => {
  exportAssets({exportBlocks: false}).catch((err) => {
    console.error(err);
    console.error(err.stack);
  });
});

gulp.task('blocks', async () => {
  exportAssets({exportBlocks: true, exportVariables: false}).catch((err) => {
    console.error(err);
    console.error(err.stack);
  });
});

gulp.task('all', async () => {
  exportAssets({exportBlocks: true, exportVariables: true}).catch((err) => {
    console.error(err);
    console.error(err.stack);
  });
});
