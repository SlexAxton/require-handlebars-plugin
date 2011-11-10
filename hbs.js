/**
 * @license require-hbs 0.1.0 - WTFPL - Alex Sexton
 * but Handlebars and require.js has it's own licensing junk
 * Also a lot of this code is inspired by James Burke's other plugins
 *
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/require-cs for details on the plugin this was based off of
 */

/* Yes, deliciously evil. */
/*jslint evil: true, strict: false, plusplus: false, regexp: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, process: false, window: false */
define('hbs', ['Handlebars'], function ( Handlebars ) {
  var fs, getXhr,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        fetchText = function () {
            throw new Error('Environment unsupported.');
        },
        buildMap = [];

    if (typeof window !== "undefined" && window.navigator && window.document) {
        // Browser action
        getXhr = function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else {
                for (i = 0; i < 3; i++) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            if (!xhr) {
                throw new Error("getXhr(): XMLHttpRequest not available");
            }

            return xhr;
        };

        fetchText = function (url, callback) {
            var xhr = getXhr();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function (evt) {
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    callback(xhr.responseText);
                }
            };
            xhr.send(null);
        };

    } else if (typeof process !== "undefined" &&
               process.versions &&
               !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');
        fetchText = function (path, callback) {
            callback(fs.readFileSync(path, 'utf8'));
        };
    } else if (typeof java !== "undefined" && typeof java.io !== "undefined") {
	    fetchText = function(path, callback) {
		    var f = new java.io.File(path);
			var is = new java.io.FileReader(f);
			var reader = new java.io.BufferedReader(is);
			var line;
			var text = "";
			while ((line = reader.readLine()) != null) {
			    text += new String(line) + "\n";
			}
			reader.close();
			callback(text);
		}
	}

      return {

        get: function () {
            return Handlebars;
        },

        write: function (pluginName, name, write) {
            if (name in buildMap) {
                var text = buildMap[name];
                write(text);
            }
        },

        version: '1.0.3beta',

        load: function (name, parentRequire, load, config) {
            var partialDeps = [];
            function findPartialDeps( text ) {
              var matches = text.match( /{{>\s*([^\s]+?)\s*}}/ig );
              var res = [];
              for (var i in matches) {
                res.push(matches[i].split(' ')[1]);
              }
              return res;
            }

            // If you name your handlebars files with the .hbs extension, change this here.
            var path = parentRequire.toUrl(name + '.handlebars');
            fetchText(path, function (text) {
                var deps = findPartialDeps( text ),
                    depStr = deps.join("', 'hbs!").replace(/_/g, '/');

                if ( depStr ) {
                  depStr = ",'hbs!" + depStr + "'";
                }

                var prec = Handlebars.precompile(text);
                text = "/* START_TEMPLATE */\n" + 
                       "define('hbs!"+name+"',['hbs','Handlebars'"+depStr+"], function( hbs, Handlebars ){ \n" +
                         "var t = Handlebars.template(" + prec + ");\n" +
                         "Handlebars.registerPartial('" + name.replace( /\//g , '_') + "', t);\n" +
                         "return t;" +
                       "});\n" +
                       "/* END_TEMPLATE */\n";

                //Hold on to the transformed text if a build.
                if (config.isBuild) {
                    buildMap[name] = text;
                }

                //IE with conditional comments on cannot handle the
                //sourceURL trick, so skip it if enabled.
                /*@if (@_jscript) @else @*/
                if (!config.isBuild) {
                    text += "\r\n//@ sourceURL=" + path;
                }
                /*@end@*/

                for ( var i in deps ) {
				  if (deps.hasOwnProperty(i)) {
                    deps[ i ] = 'hbs!' + deps[ i ].replace(/_/g, '/'); 
				  }
                }

                if ( !config.isBuild ) {
                  require( deps, function (){
                    load.fromText(name, text);

                    //Give result to load. Need to wait until the module
                    //is fully parse, which will happen after this
                    //execution.
                    parentRequire([name], function (value) {
                      load(value);
                    });
                  });
                }
                else {
                  load.fromText(name, text);

                  //Give result to load. Need to wait until the module
                  //is fully parse, which will happen after this
                  //execution.
                  parentRequire([name], function (value) {
                    load(value);
                  });
                }
            });
        }
      };
});
