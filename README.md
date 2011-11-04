# Require.js Handlebars Plugin

## Version

Handlebars : v1.0.3beta

hbs.js     : v0.1.0

## Requirements

Should work in both the java and node build environments.

Require.js >= 0.27.0 (I recommend 1.0.1+)

## Usage

Write a template ( path: `App/Template/One.handlebars` ):

```html
<div class="best plugin ever">
  This is my {{ adjective }} template.

  {{! To include a partial: }}
  {{! Use underscores instead of slashes in your path, }}
  {{! and leave off the extension. }}

  {{> App_Template_CoolPartial }}
</div>
```

Here's the partial (optional) ( path : `App/Template/CoolPartial.handlebars` )

```html
<div>
  {{! This can obviously have it's own partials, etc, etc }}
  I am a partial
</div>
```

Include the `hbs.js` plugin and the `Handlebars.js` file in the same directory as your require.js script is. Usually, this is similar to the following.

```sh
~/Code/scripts/require.js
~/Code/scripts/hbs.js
~/Code/scripts/Handlebars.js
~/Code/scripts/App/Template/One.handlebars
~/Code/scripts/App/Template/CoolPartial.handlebars
```

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

# Builds

As long as all of your paths match up, this should precompile all of your templates and include them in the build.

# Demo

To run the demo, go into the root directory of this project and run the following command.

`node r.js -o demo/app.build.js`

This requires that node.js is installed. To see these in your browser, I'd suggest serving them quickly with the python simple server. (Linux/OSX assumed here, but there is a java implementation of the require.js build that should work just as well as the node version. I have not tried it though.)

```sh
cd ~/require-handlebars-plugin
python -m SimpleHTTPServer
```

Then visit `http://127.0.0.1:8000/demo.html` for the dev version.

And visit `http://127.0.0.1:8000/demo-build.html` for the production build version.

You should be able to see all of the templates and individual files in your network panel in dev mode, and just 2 minified files in build mode. 

# Notes/QA

## Partial Collision

This plugin registers every single template as a partial with it's modified module name (Slashes replaced with underscores, and no file extension). 

`App/Template/One.handlebars` is registered as `App_Template_One`

I'd encourage you to _not_ call registerPartials in your code, and just use the automatic module registering, that way you definitely won't hit any collisions. You could also just be careful. We're all adults here.

## Templates not loading cross-domain

In dev mode, loading the templates requires that you are on the same domain as your templates. This is standard same origin policy stuff. Once you build, though, it won't matter since there are no additional requests. Usually a few cleverly placed host overrides get you through the dev mode hurdles.

## Doesn't work with my version of Handlebars

This is a barely modified version of handlebars 1.0.3beta (which went out to the world with a non-updated version tag 1.0.2beta, whoops). Some of the functionality in here is new, but none of it should be specific exactly to what makes this work. Though, I did take out the code that tries to identify node.js and act differently, since we want it to be picked up by `require.js` and not the built-in node.js `require` keyword. I also turned it into a proper amd module, which makes it "require-able". There's nothing too crazy, though, so I'd suggest just using it to save yourself time. Or don't.

# Other Templating Languages

_Very_ little of this is specific to handlebars, but things are just a _tiny_ bit too specific about how everything works to properly generalize this.

If you'd like to implement this for your templating language of choice, you'll need:

* Has a pre-compile type functionality (unless you don't care about builds)
* If it has some concept of partials, that you can register them externally
* It eventually returns a function that takes data context and outputs something you can deal with.

I'd just turn your template language into a module first (just the old global name, or whatever), then look through the references to `Handlebars` in `hbs.js` and see if your templating language does something similar. It's not a terribly complicated process.

# License

Most of the code in this is from James Burke and Yehuda Katz in require.js and handlebars.js (respectively). Those projects are under their own license. Any other code added by me is released under the WTFPL license.
