({
    appDir: "./",
    baseUrl: "./",
    dir: "../demo-build",

    optimizeCss: "standard",
    // optimize: "none",
    // inlining ftw
    inlineText: true,

    pragmasOnSave: {
        //removes Handlebars.Parser code (used to compile template strings) set
        //it to `false` if you need to parse template strings even after build
        excludeHbsParser : true,
        // kills the entire plugin set once it's built.
        excludeHbs: true,
        // removes handlebars and json2
        excludeAfterBuild: true
    },
    exclude: ["handlebars"],
    include: ["handlebars.runtime"],

    paths: {
      "hbs": "../hbs"
      // if your project is already using underscore.js and you want to keep
      // the hbs plugin even after build (excludeHbs:false) you should set the
      // "hbs/underscore" path to point to the shared location like
      // "hbs/underscore" : "lib/underscore" to avoid loading it twice
    },

    locale: "en_ca",

    // default plugin settings, listing here just as a reference
    hbs : {
        templateExtension : 'hbs',
        helperDirectory : "template/helpers/"
    },

    modules: [
        {
            name: "main"
        }
    ]
})
