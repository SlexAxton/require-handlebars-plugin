({
    appDir: "./",
    baseUrl: "./",
    dir: "../demo-build",

    optimizeCss: "standard",
    // optimize: "none",
    // inlining ftw
    inlineText: true,

    stubModules: ['hbs', 'hbs/underscore', 'hbs/json2', 'hbs/handlebars'],

    paths: {
      "hbs": "../hbs",
      "handlebars": "../hbs/handlebars.runtime"
      // if your project is already using underscore.js and you want to keep
      // the hbs plugin even after build (excludeHbs:false) you should set the
      // "hbs/underscore" path to point to the shared location like
      // "hbs/underscore" : "lib/underscore" to avoid loading it twice
    },

    locale: "en_ca",

    hbs : {
        // default plugin settings, listing here just as a reference
        templateExtension : 'hbs',
        helperDirectory : "template/helpers/",

        handlebarsPath: "handlebars"
    },

    modules: [
        {
            name: "main"
        }
    ]
})
