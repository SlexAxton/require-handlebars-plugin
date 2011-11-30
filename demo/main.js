// Require our template with the handlebars plugin
define('main',['require', 'hbs', './foo/test_path'], function (require, hbs) {

  //allow customization without editing shource
  //note that further hbs! requires/defines will load files with .handlebars
  //extension, beware that it may break things badly, use it with care and only
  //before loading other templates...
  hbs.setExtension('.handlebars');

  require(['hbs!template/one'], function(tmplOne){
    // Find our container
    var container = document.getElementById('demo-app-container');
    // Run your template function, and inject it.
    container.innerHTML = tmplOne({
      adjective : 'favorite'
    });
  });

});
