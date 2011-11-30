({
    appDir: "./",
    baseUrl: "./",
    dir: "../demo-build",

    optimizeCss: "standard",
    //optimize: "none",
    // inlining ftw
    inlineText: true,

    // kills the entire plugin set once it's built.
    pragmasOnSave: {
        excludeAfterBuild: true
    },

    paths: {
      "hbs": "../hbs",
      "Handlebars" : "../Handlebars"
    },

    locale: "en_ca",

    modules: [
        //Optimize the application files. Exclude jQuery since it is
        //included already in require-jquery.js
        {
            name: "main",
        }
    ]
})