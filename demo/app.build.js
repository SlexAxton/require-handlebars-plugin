({
    appDir: "./",
    baseUrl: "./",
    dir: "../demo-build",

    optimizeCss: "standard",

    // inlining ftw
    inlineText: true,

    paths: {
      "hbs": "../hbs",
      "Handlebars" : "../Handlebars"
    },

    modules: [
        //Optimize the application files. Exclude jQuery since it is
        //included already in require-jquery.js
        {
            name: "main",
        }
    ]
})