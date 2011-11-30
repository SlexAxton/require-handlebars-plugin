define(['hbs!./test_path'], function (template) {

  var container = document.createElement('div');
  //innerHtml is evil! don't use it on a node with child elements.
  container.innerHTML += template({'name' : 'testpath'});
  document.body.appendChild(container);

});
