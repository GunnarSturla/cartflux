Package.describe({
  name: 'gunnarsturla:meteorflux-store',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('meteorflux:dispatcher');
  api.versionsFrom('1.1.0.2');
  api.addFiles('store.js');
  api.export('Store');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gunnarsturla:meteorflux-store');
  api.addFiles('store-tests.js');
});
