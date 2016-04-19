# Require.js Handlebars Plugin

[![devDependency Status](https://david-dm.org/SlexAxton/require-handlebars-plugin/dev-status.svg)](https://david-dm.org/SlexAxton/require-handlebars-plugin#info=devDependencies)

## Requirements

Should work in both the java and node build environments.

Require.js >= 2.1.x (The last tag to work for Require < 2.1 is the `0.3.3` tag)

## Usage

Write a template ( path: `App/Template/One.hbs` ):

```html
<div class="best plugin ever">
  This is my {{ adjective }} template.

  {{! To include a partial: }}
  {{! just provide the path to the partial without the extension }}

  {{> App/Template/CoolPartial }}

  {{! the path can also be relative to the current template: }}
  {{> ./coolPartial }}
</div>
```

Here's the partial (optional) ( path : `App/Template/CoolPartial.hbs` )

```html
<div>
  {{! This can obviously have it's own partials, etc, etc }}
  I am a partial
</div>
```

## Installation
Clone this repo* or use `bower` to add `require-handlebars-plugin` to your project (typically in you `lib/` directory) and make sure you tell `requirejs` about the new `hbs` plugin by editing your `requirejs.conf.js` file (you can also pass a few options):

    require.config({
    	paths: {
    		hbs: 'lib/require-handlebars-plugin/hbs'
    	},
    	hbs: { // optional
    		helpers: true,            // default: true
    		templateExtension: 'hbs', // default: 'hbs'
    		partialsUrl: ''           // default: ''
		}
    });

`partialsUrl`: base url for loading partials so that you don't have to provide the full path every time you need to load a partial within a template.


Then require your templates like so:

```javascript
require(['hbs!App/Template/One'], function ( tmplOne ) {
  // Use whatever you would to render the template function
  document.body.innerHTML = tmplOne({adjective: "favorite"});
});
```


And then the output into your body would be as follows:

```html
<div class="best plugin ever">
  This is my favorite template.

  <div>
    I am a partial
  </div>
</div>

```

YAY!

\* Note that if you clone the require-handlebars-plugin repository into an existing git repository, the existing repo will not include the files within the newly-cloned require-handlebars-plugin repo, because git ignores all subfolders which are git repos of their own. Look into git's submodules feature as a way to solve this issue.

# i18n

As of the latest version. This functionality has been removed. Probably use format-js for this.

# Helpers

Just put your helpers in `templates/helpers/*` and they'll automagically get pulled in as long as you write them as modules.

I find that many helpers are good helpers in regular code as well, so the following is a good practice:

```javascript
define('templates/helpers/roundNumber', ['handlebars'], function ( Handlebars ) {
  function roundNumber ( context, options ) {
    // Simple function for example
    return Math.round( context );
  }
  Handlebars.registerHelper( 'roundNumber', roundNumber );
  return roundNumber;
});
```

Then in your templates, you can just do:

```mustache
{{roundNumber Data.ThreeFourths}}
```

The system will make sure these modules are pulled in automatically from that directory. But if in your app, you need a rounding module (perhaps in a view/datanormalization place), you could do this:

```javascript
require(['templates/helpers/roundNumber'], function ( roundNumber ) {
  var threeFourths = (3/4);
  alert( roundNumber( threeFourths ));
});
```

It's just a module that happens to register itself.

You can specify a helper path callback in the config. The callback should be a function that gets a name of a helper as the only argument and returns the full path to be `require()`-d, e.g., the following callback allows for automatic loading of helper modules written in CoffeeScript (via the require-cs plugin) under a non-standard location:

```javascript
require({
  hbs : {
    helperPathCallback: function(name) {return 'cs!/helpers/' + name;}
  }
}, ['main'])
```

# Meta Data

Any template that begins with a comment, with _only_ a valid json object in it will be read in as meta data for the template.

I encourage you to list the name of the template and give a description, though these aren't strictly necessary.

## Styles

If you want to build stylesheets that are comprised of only styles needed by the templates that your app uses, I encourage you to add a `styles` property to the meta info:

```
{{!
{
  "name" : "template1",
  "description" : "A nice template.",
  "styles" : ["templatecss"]
}
}}
```

This will inject a link tag in dev mode to load in this style dynamically. At build time, a screen.build.css is created. At this time it is just a list of import statements. These can be inlined by many existing tools. Eventually I'd love it to just happen.

De-duping happens automatically, so don't worry if multiple templates require the same styles. The styles are injected in the order that they are read in, so usually from least specific to most specific. This is usually what you want, but know that if you do weird things, it could break.

# Introspection

In dev mode a few properties are added to your function (an object in javascript) as a helper with debugging and as a testing plug-point.

Those variables look like the following:

```javascript
require(['hbs!template/one'], function ( tmplOne ) {
  console.log(
    'Variables referenced in this template: ',                     tmplOne.vars,
    'Partials/templates that this file directly depends on: ',     tmplOne.deps,
    'Helpers that this template directly depends on: ',            tmplOne.helpers,
    'The metadata object at the top of the file (if it exists): ', tmplOne.meta
  );
});
```

Note: All of these go away after a build, as they just take up space with data that is known at build time, which is the ideal time to get stuff figured out (speed-wise).

# Builds

As long as all of your paths match up, this should precompile all of your templates and include them in the build.

You can stub out the hbs plugin in the build using [stubModules](https://github.com/jrburke/r.js/blob/master/build/example.build.js#L316) the same way you would for other plugins that inline the final function. Your helpers and compiled templates still need to load Handlebars though, so you'll need to make sure they load the runtime version of Handlebars included in this repo as `hbs/handlebars.runtime.js`. You just need to do 2 things for that in your build config:

1. Make sure hbs.handlebarsPath resolves to hbs/handlebars.runtime.js
2. Make sure your helpers load the same file

See the [example build configuration](https://github.com/SlexAxton/require-handlebars-plugin/blob/master/demo/app.build.js) for a way to do that by setting `handlebarsPath` to `handlebars`, having the helpers load `handlebars`, and setting `handlebars` to hbs/handlebars.runtime in the paths.config

## Before Build

![Before Build](http://i.imgur.com/YSTI3.jpg)

## After Build

![After Build](http://i.imgur.com/JUOlC.jpg)

## So many dependencies in the `hbs` plugin!

I use them for coding happiness. It shouldn't bother you tooooo much, because it all gets built out in production. The `hbs.js` file essentially gets written to the main.js file as a noop (a few empty definitions), and none of it's dependencies are included into the build. All the dependencies are inside the `hbs` folder and this folder should be a sibling of the `hbs.js` file.

# Demo

To run the demo, go into the root directory of this project and run the following command.

`./build.sh`

This requires that node.js is installed. To see these in your browser, I'd suggest serving them quickly with the python simple server. (Linux/OSX assumed here, but there is a java implementation of the require.js build that should work just as well as the node version. I have not tried it though.)

```sh
cd ~/require-handlebars-plugin
python -m SimpleHTTPServer
```

You could also use the node 'serve' module.

```sh
npm install serve -g
serve .
```

Then visit `http://127.0.0.1:8000/demo.html` for the dev version.

And visit `http://127.0.0.1:8000/demo-build.html` for the production build version.

You should be able to see all of the templates and individual files in your network panel in dev mode, and just 2 minified files in build mode.

# Config

There are several configurable options, which you can set in your require.config:

```javascript
require.config({
  // ... other require config here

  // hbs config
  hbs: {
    helpers: false,               // When false, won't look for and try to automatically load
                                  // helpers (true by default)

    helperPathCallback:           // Callback to determine the path to look for helpers
      function (name) {           // ('/templates/helpers/'+name by default)
        return 'cs!' + name;
      },

    templateExtension: "html"     // Set the extension automatically appended to templates
                                  // ('hbs' by default)

    handlebarsPath:               // Custom path to handlebars for compiled templates
      'some/path/to/handlebars'   // ('hbs/handlebars' by default). Could simply be 'handlebars'
                                  // as long as it is defined in paths. If you are stubbing out
                                  // the plugin in an optimized build, use this to point to 
                                  // the runtime hbs (see demo/app.build.js)

    compileOptions: {}            // options object which is passed to Handlebars compiler
  }

})
```

# Notes/QA

## Partial Collision

This plugin registers every single template as a partial with it's modified module name and no file extension.

`App/Template/One.handlebars` is registered as `App_Template_One`

I'd encourage you to _not_ call registerPartials in your code, and just use the automatic module registering, that way you definitely won't hit any collisions. You could also just be careful. We're all adults here.

## Templates not loading cross-domain

In dev mode, loading the templates requires that you are on the same domain as your templates. This is standard same origin policy stuff. Once you build, though, it won't matter since there are no additional requests. Usually a few cleverly placed host overrides get you through the dev mode hurdles.

# Other Templating Languages

_Very_ little of this is specific to handlebars, but things are just a _tiny_ bit too specific about how everything works to properly generalize this.

If you'd like to implement this for your templating language of choice, you'll need:

* Has a pre-compile type functionality (unless you don't care about builds)
* If it has some concept of partials, that you can register them externally
* It eventually returns a function that takes data context and outputs something you can deal with.
* For any of the meta-data, you'll need some fancy regex or an AST to walk through.

I'd just turn your template language into a module first (just the old global name, or whatever), then look through the references to `Handlebars` in `hbs.js` and see if your templating language does something similar. It's not a terribly complicated process.

# License

Most of the code in this is from James Burke and Yehuda Katz in require.js and handlebars.js (respectively). Those projects are under their own license. Any other code added by me is released under the WTFPL license.
