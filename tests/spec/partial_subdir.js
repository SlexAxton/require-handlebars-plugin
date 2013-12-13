define(['hbs!'+require.toUrl('tests/templates/partial_subdir'),'hbs!'+require.toUrl('tests/templates/subdir/parent')], function(template, parentTemplate) {

  describe("template with a partial in a subdirectory {{> partials/_simple}}", function() {

    it("loads the partials", function() {

      var html = template({partialValue: "ha"});
      var container = document.createElement('div');
      container.innerHTML = html;
      var bs = container.getElementsByTagName('b');
      expect(bs).to.exist;
      expect(bs.length).to.equal(1);
      expect(bs[0].innerText).to.equal('Hello ha');

    });

  });

  describe("template with a partial in a higher directory", function() {

    it("loads the partial using {{> ../partials/_simple}}", function() {

      var html = parentTemplate({partialValue: "ha"});
      var container = document.createElement('div');
      container.innerHTML = html;
      var bs = container.getElementsByTagName('b');
      expect(bs).to.exist;
      expect(bs.length).to.equal(1);
      expect(bs[0].innerText).to.equal('Hello ha');

    });

  });

});
