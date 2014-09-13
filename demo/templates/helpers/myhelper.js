define(["hbs/handlebars"], function(Handlebars) {
  function myhelper(options) {
    return options.fn();
  }

  Handlebars.registerHelper("myhelper", myhelper);
  return myhelper;
});
