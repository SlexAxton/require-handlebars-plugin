require.config({
    // default plugin settings, listing here just as a reference
    hbs : {
        templateExtension : 'hbs',
        // if disableI18n is `true` it won't load locales and the i18n helper
        // won't work as well.
        disableI18n : false
    }
});

// Require our template with the handlebars plugin
define(['hbs!template/one'], function (tmplOne) {
  // Find our container
  var container = document.getElementById('demo-app-container');
  // Run your template function, and inject it.
  container.innerHTML = tmplOne({
    adjective : 'favorite'
  });
});
