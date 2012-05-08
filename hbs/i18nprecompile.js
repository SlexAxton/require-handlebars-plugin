//>>excludeStart('excludeAfterBuild', pragmas.excludeAfterBuild)
define(['Handlebars', "./underscore"], function ( Handlebars, _ ) {

  function replaceLocaleStrings ( ast, mapping ) {
    mapping = mapping || {};
    // Base set of things
    if ( ast && ast.type === "program" && ast.statements ) {
      _(ast.statements).forEach(function(statement, i){
        var newString = "<!-- i18n error -->";
        // If it's a translation node
        if ( statement.type == "mustache" && statement.id && statement.id.original == "$" ) {
          
          if ( statement.params.length && statement.params[0].string ) {
            newString = mapping[ statement.params[0].string ] || newString;
          }
          ast.statements[i] = new Handlebars.AST.ContentNode(newString);
        }
        // If we need to recurse
        else if ( statement.program ) {
          statement.program = replaceLocaleStrings( statement.program, mapping );
        }
      });
    }
    return ast;
  }
  
  return function(string, mapping, options) {
    options = options || {};
    var ast, environment;
    ast = Handlebars.parse(string);
    // avoid replacing locale if mapping is `false`
    if (mapping !== false) {
        ast = replaceLocaleStrings(ast, mapping);
    }
    environment = new Handlebars.Compiler().compile(ast, options);
    return new Handlebars.JavaScriptCompiler().compile(environment, options);
  };
});
//>>excludeEnd('excludeAfterBuild')
