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

Include the hbs.js plugin in the same directory as your require.js script is.

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

# Notes

This plugin registers every single template as a partial with it's modified module name (Slashes replaced with underscores, and no file extension). I'd encourage you to _not_ registerPartials in your code, and just use the module registering, that way you definitely won't hit any collisions. You could also just be careful. We're all adults here.

# License

Most of the code in this is from James Burke and Yehuda Katz in require.js and handlebars.js (respectively). Those projects are under their own license. Any other code added by me is released under the WTFPL license.
