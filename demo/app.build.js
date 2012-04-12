({
    appDir: "./",
    baseUrl: "./",
    dir: "../demo-build",

    optimizeCss: "standard",
    //optimize: "none",
    // inlining ftw
    inlineText: true,

    pragmasOnSave: {
        //removes Handlebars.Parser code (used to compile template strings)
        //set it to `false` if you need template strings even after build
        excludeHbsParser : true,
        // kills the entire plugin set once it's built.
        excludeHbs: true,
        //removes i18n precompiler
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

            //the hbs plugin requires underscore
            //the only way to remove it after build is to manually exclude it
            //if you require underscore, comment out this line
            exclude: ['underscore']
        }
    ]
})
