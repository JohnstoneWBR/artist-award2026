import ghpages from 'gh-pages';

console.log('Starting deployment to GitHub Pages...');
ghpages.publish('dist', {
  clone: '.gh-pages-cache'
}, function(err) {
  if (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  }
  console.log('Deployment successful! Your site is live.');
});
