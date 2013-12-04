/**
 * @license Handlebars hbs 0.4.0 - Alex Sexton, but Handlebars has it's own licensing junk
 *
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/require-cs for details on the plugin this was based off of
 */

/* Yes, deliciously evil. */
/*jslint evil: true, strict: false, plusplus: false, regexp: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
define: false, process: false, window: false */
define([
//>>excludeStart('excludeHbs', pragmas.excludeHbs)
'Handlebars', 'underscore', 'i18nprecompile', 'json2'
//>>excludeEnd('excludeHbs')
], function (
//>>excludeStart('excludeHbs', pragmas.excludeHbs)
 Handlebars, _, precompile, JSON
//>>excludeEnd('excludeHbs')
) {
//>>excludeStart('excludeHbs', pragmas.excludeHbs)
  var fs, getXhr,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        fetchText = function () {
            throw new Error('Environment unsupported.');
        },
        buildMap = [],
        filecode = "w+",
        templateExtension = "hbs",
        customNameExtension = "@hbs",
        devStyleDirectory = "/styles/",
        buildStyleDirectory = "/demo-build/styles/",
        helperDirectory = "template/helpers/",
        i18nDirectory = "template/i18n/",
        buildCSSFileName = "screen.build.css";

    Handlebars.registerHelper('$', function() {
        //placeholder for translation helper
    });

    if (typeof window !== "undefined" && window.navigator && window.document && !window.navigator.userAgent.match(/Node.js/)) {
        // Browser action
        getXhr = function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
               return ((arguments[0] === true)) ? new XDomainRequest() : new XMLHttpRequest();
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

        // Returns the version of Windows Internet Explorer or a -1
        // (indicating the use of another browser).
        getIEVersion = function(){
           var rv = -1; // Return value assumes failure.
           if (navigator.appName == 'Microsoft Internet Explorer')
           {
              var ua = navigator.userAgent;
              var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
              if (re.exec(ua) != null)
                 rv = parseFloat( RegExp.$1 );
           }
           return rv;
        };

        fetchText = function (url, callback) {
          var uidx = (url.substr(0,5)==="https") ? 8 : 7;
          var hidx = (window.location.href.substr(0,5)==="https") ? 8 : 7;
          var dom  = url.substr(uidx).split("/").shift();
          var msie = getIEVersion();
          var xdm  = ( dom != window.location.href.substr(hidx).split("/").shift() ) && (msie > -1);
              xdm  = (msie >= 7);
          if( xdm )
          {
             var xdr = getXhr(true);
            xdr.open('GET', url);
            xdr.onload = function(){
              callback(xdr.responseText);
            };
            xdr.onprogress = function(){};
            xdr.ontimeout = function(){};
            xdr.onerror = function(){};
            setTimeout( function(){ xdr.send(); }, 0 );
          }
          else
          {
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
          }
        };

    } else if (typeof process !== "undefined" &&
               process.versions &&
               !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');
        fetchText = function ( path, callback ) {
            var body = fs.readFileSync(path, 'utf8') || "";
            // we need to remove BOM stuff from the file content
            body = body.replace(/^\uFEFF/, '');
            callback(body);
        };
    } else if (typeof java !== "undefined" && typeof java.io !== "undefined") {
        fetchText = function(path, callback) {
            var f = new java.io.File(path);
            var is = new java.io.FileReader(f);
            var reader = new java.io.BufferedReader(is);
            var line;
            var text = "";
            while ((line = reader.readLine()) !== null) {
                text += new String(line) + "\n";
            }
            reader.close();
            callback(text);
        };
    }

    var cache = {};
    var fetchOrGetCached = function ( path, callback ){
      if ( cache[path] ){
        callback(cache[path]);
      }
      else {
        fetchText(path, function(data){
          cache[path] = data;
          callback.call(this, data);
        });
      }
    };
    var styleList = [], styleMap = {};
//>>excludeEnd('excludeHbs')

      return {

        get: function () {
            return Handlebars;
        },

        write: function (pluginName, name, write) {

            if ( (name + customNameExtension ) in buildMap) {
                var text = buildMap[name + customNameExtension];
                write.asModule(pluginName + "!" + name, text);
            }
        },

        version: '0.4.0',

        load: function (name, parentRequire, load, config) {
          //>>excludeStart('excludeHbs', pragmas.excludeHbs)

            var compiledName = name + customNameExtension,
                disableI18n = (config.hbs && config.hbs.disableI18n),
                partialDeps = [];

            function recursiveNodeSearch( statements, res ) {
              _(statements).forEach(function ( statement ) {
                if ( statement && statement.type && statement.type === 'partial' ) {
                    res.push(statement.partialName.name);
                }
                if ( statement && statement.program && statement.program.statements ) {
                  recursiveNodeSearch( statement.program.statements, res );
                }
                if ( statement && statement.program && statement.program.inverse && statement.program.inverse.statements ) {
                  recursiveNodeSearch( statement.program.inverse.statements, res );
                }
              });
              return res;
            }

            // TODO :: use the parser to do this!
            function findPartialDeps( nodes ) {
              var res   = [];
              if ( nodes && nodes.statements ) {
                res = recursiveNodeSearch( nodes.statements, [] );
              }
              return _(res).unique();
            }

            // See if the first item is a comment that's json
            function getMetaData( nodes ) {
              var statement, res, test;
              if ( nodes && nodes.statements ) {
                statement = nodes.statements[0];
                if ( statement && statement.type === "comment" ) {
                  try {
                    res = ( statement.comment ).replace(new RegExp('^[\\s]+|[\\s]+$', 'g'), '');
                    test = JSON.parse(res);
                    return res;
                  }
                  catch (e) {
                    return "{ \"description\" : \"" + statement.comment + "\" }";
                  }
                }
              }
              return "{}";
            }
            function composeParts ( parts ) {
              if ( !parts ) {
                return [];
              }
              var res = [parts[0]],
                  cur = parts[0],
                  i;

              for (i = 1; i < parts.length; ++i) {
                if ( parts.hasOwnProperty(i) ) {
                  cur += "." + parts[i];
                  res.push( cur );
                }
              }
              return res;
            }

            function recursiveVarSearch( statements, res, prefix, helpersres ) {
              prefix = prefix ? prefix+"." : "";

              var  newprefix = "", flag = false;

              // loop through each statement
              _(statements).forEach(function ( statement ) {
                var parts, part, sideways;

                // if it's a mustache block
                if ( statement && statement.type && statement.type === 'mustache' ) {

                  // If it has params, the first part is a helper or something
                  if ( !statement.params || ! statement.params.length ) {
                    parts = composeParts( statement.id.parts );
                    for( part in parts ) {
                      if ( parts[ part ] ) {
                        newprefix = parts[ part ] || newprefix;
                        res.push( prefix + parts[ part ] );
                      }
                    }
                    res.push(prefix + statement.id.string);
                  }

                  var paramsWithoutParts = ['this', '.', '..', './..', '../..', '../../..'];

                  // grab the params
                  if ( statement.params && typeof Handlebars.helpers[statement.id.string] === 'undefined') {
                    _(statement.params).forEach(function(param) {
                      if ( _(paramsWithoutParts).contains(param.original)
                         || param instanceof Handlebars.AST.StringNode
                        || param instanceof Handlebars.AST.IntegerNode
                        || param instanceof Handlebars.AST.BooleanNode
                        ) {
                        helpersres.push(statement.id.string);
                      }

                      parts = composeParts( param.parts );

                      for(var part in parts ) {
                        if ( parts[ part ] ) {
                          newprefix = parts[part] || newprefix;
                          helpersres.push(statement.id.string);
                          res.push( prefix + parts[ part ] );
                        }
                      }
                    });
                  }
                }

                // If it's a meta block
                if ( statement && statement.mustache  ) {
                  recursiveVarSearch( [statement.mustache], res, prefix + newprefix, helpersres );
                }

                // if it's a whole new program
                if ( statement && statement.program && statement.program.statements ) {
                  sideways = recursiveVarSearch([statement.mustache],[], "", helpersres)[0] || "";
                  if ( statement.program.inverse && statement.program.inverse.statements ) {
                    recursiveVarSearch( statement.program.inverse.statements, res, prefix + newprefix + (sideways ? (prefix+newprefix) ? "."+sideways : sideways : ""), helpersres);
                  }
                  recursiveVarSearch( statement.program.statements, res, prefix + newprefix + (sideways ? (prefix+newprefix) ? "."+sideways : sideways : ""), helpersres);
                }
              });
              return res;
            }

            // This finds the Helper dependencies since it's soooo similar
            function getExternalDeps( nodes ) {
              var res   = [];
              var helpersres = [];

              if ( nodes && nodes.statements ) {
                res = recursiveVarSearch( nodes.statements, [], undefined, helpersres );
              }

              var defaultHelpers = ["helperMissing", "blockHelperMissing", "each", "if", "unless", "with"];

              return {
                vars : _(res).chain().unique().map(function(e){
                  if ( e === "" ) {
                    return '.';
                  }
                  if ( e.length && e[e.length-1] === '.' ) {
                    return e.substr(0,e.length-1) + '[]';
                  }
                  return e;
                }).value(),
                helpers : _(helpersres).chain().unique().map(function(e){
                  if ( _(defaultHelpers).contains(e) ) {
                    return undefined;
                  }
                  return e;
                }).compact().value()
              };
            }

            function fetchAndRegister(langMap){
              fetchText(path, function (text) {
                  // for some reason it doesn't include hbs _first_ when i don't add it here...
                  var nodes = Handlebars.parse(text),
                      deps = findPartialDeps( nodes ),
                      meta = getMetaData( nodes ),
                      extDeps = getExternalDeps( nodes ),
                      vars = extDeps.vars,
                      helps = (extDeps.helpers || []),
                      depStr = deps.join("', 'hbs!").replace(/_/g, '/'),
                      debugOutputStart = "",
                      debugOutputEnd   = "",
                      debugProperties = "",
                      helpDepStr, metaObj, head, linkElem;

                  if(meta !== "{}") {
                    try {
                      metaObj = JSON.parse(meta);
                    } catch(e) {
                      console.log("couldn't parse meta for %s", path);
                    }
                  }

                  helps = helps.concat(metaObj.helpers || []);
                  helpDepStr = config.hbs && config.hbs.disableHelpers ?
                      "" : (function (){
                        var i, paths = [],
                            pathGetter = config.hbs && config.hbs.helperPathCallback
                              ? config.hbs.helperPathCallback
                              : function (name){return (config.hbs && config.hbs.helperDirectory ? config.hbs.helperDirectory : helperDirectory) + name;};

                        for ( i = 0; i < helps.length; i++ ) {
                          paths[i] = "'" + pathGetter(helps[i], path) + "'"
                        }
                        return paths;
                      })().join(',');

                  if ( depStr ) {
                    depStr = ",'hbs!" + depStr + "'";
                  }
                  if ( helpDepStr ) {
                    helpDepStr = "," + helpDepStr;
                  }

                  if (metaObj) {
                    try {
                      if (metaObj.styles) {
                        styleList = _.union(styleList, metaObj.styles);

                        // In dev mode in the browser
                        if ( require.isBrowser && ! config.isBuild ) {
                          head = document.head || document.getElementsByTagName('head')[0];
                          _(metaObj.styles).forEach(function (style) {
                            if ( !styleMap[style] ) {
                              linkElem = document.createElement('link');
                              linkElem.href = config.baseUrl + devStyleDirectory + style + '.css';
                              linkElem.media = 'all';
                              linkElem.rel = 'stylesheet';
                              linkElem.type = 'text/css';
                              head.appendChild(linkElem);
                              styleMap[style] = linkElem;
                            }
                          });
                        }
                        else if ( config.isBuild ) {
                          (function(){
                            var fs  = require.nodeRequire('fs'),
                                str = _(metaObj.styles).map(function (style) {
                                  if (!styleMap[style]) {
                                    styleMap[style] = true;
                                    return "@import url("+style+".css);\n";
                                  }
                                  return "";
                                }).join("\n");

                            // I write out my import statements to a file in order to help me build stuff.
                            // Then I use a tool to inline my import statements afterwards. (you can run r.js on it too)
                            fs.open(__dirname + buildStyleDirectory + buildCSSFileName, filecode, '0666', function( e, id ) {
                              fs.writeSync(id, str, null, encoding='utf8');
                              fs.close(id);
                            });
                            filecode = "a";
                          })();
                        }
                      }
                    }
                    catch(e){
                      console.log('error injecting styles');
                    }
                  }

                  if ( ! config.isBuild && ! config.serverRender ) {
                    debugOutputStart = "<!-- START - " + name + " -->";
                    debugOutputEnd = "<!-- END - " + name + " -->";
                    debugProperties = "t.meta = " + meta + ";\n" +
                                      "t.helpers = " + JSON.stringify(helps) + ";\n" +
                                      "t.deps = " + JSON.stringify(deps) + ";\n" +
                                      "t.vars = " + JSON.stringify(vars) + ";\n";
                  }

                  var mapping = disableI18n? false : _.extend( langMap, config.localeMapping ),
                      configHbs = config.hbs || {},
                      options = _.extend(configHbs.compileOptions || {}, { originalKeyFallback: configHbs.originalKeyFallback }),
                      prec = precompile( text, mapping, options),
                      tmplName = config.isBuild ? '' : "'" + name + "',";

                  text = "/* START_TEMPLATE */\n" +
                         "define("+tmplName+"['hbs','Handlebars'"+depStr+helpDepStr+"], function( hbs, Handlebars ){ \n" +
                           "var t = Handlebars.template(" + prec + ");\n" +
                           "Handlebars.registerPartial('" + name.replace( /\//g , '_') + "', t);\n" +
                           debugProperties +
                           "return t;\n" +
                         "});\n" +
                         "/* END_TEMPLATE */\n";

                  //Hold on to the transformed text if a build.
                  if (config.isBuild) {
                      buildMap[compiledName] = text;
                  }

                  //IE with conditional comments on cannot handle the
                  //sourceURL trick, so skip it if enabled.
                  /*@if (@_jscript) @else @*/
                  if (!config.isBuild) {
                      text += "\r\n//@ sourceURL=" + path;
                  }
                  /*@end@*/

                  for ( var i in deps ) {
                    if ( deps.hasOwnProperty(i) && typeof deps[i] === 'string') {  // make sure string, because we're iterating over all props
                      deps[ i ] = 'hbs!' + deps[ i ].replace(/_/g, '/');
                    }
                  }

                  if ( !config.isBuild ) {
                    require( deps, function (){
                      load.fromText(text);

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

            var path,
                omitExtension = config.hbs && config.hbs.templateExtension === false;
            if(omitExtension) {
              path = parentRequire.toUrl(name);
            } else {
              path = parentRequire.toUrl(name +'.'+ (config.hbs && config.hbs.templateExtension ? config.hbs.templateExtension : templateExtension));
            }

            if (disableI18n){
                fetchAndRegister(false);
            } else {
            	// Workaround until jam is able to pass config info or we move i18n to a separate module.
            	// This logs a warning and disables i18n if there's an error loading the language file
            	var langMapPath = (config.hbs && config.hbs.i18nDirectory ? config.hbs.i18nDirectory : i18nDirectory) + (config.locale || "en_us") + '.json';
            	try {
					fetchOrGetCached(parentRequire.toUrl(langMapPath), function (langMap) {
					  fetchAndRegister(JSON.parse(langMap));
					});
                } catch(er) {
                	// if there's no configuration at all, log a warning and disable i18n for this and subsequent templates
                	if(!config.hbs) {
                		console.warn('hbs: Error reading ' + langMapPath + ', disabling i18n. Ignore this if you\'re using jam, otherwise check your i18n configuration.\n');
						config.hbs = {disableI18n: true};
                		fetchAndRegister(false);
                	} else {
                		throw er;

                	}
                }
            }
          //>>excludeEnd('excludeHbs')
        }
      };
});
/* END_hbs_PLUGIN */
