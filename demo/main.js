// Require our template with the handlebars plugin
define('main',['require', 'hbs'], function (require, hbs) {

  //allow customization without editing shource
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
