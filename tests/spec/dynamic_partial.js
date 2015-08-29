define(['hbs!'+require.toUrl('tests/templates/dynamic_partial')], function(template) {

  describe("template with a dynamic partial", function() {

    it("loads the dynamic partial", function() {

      var html = template({
        partialValue: "ha",
        variable: "tests/templates/partial"
      });
      var container = document.createElement('div');
      container.innerHTML = html;
      var bs = container.getElementsByTagName('b');
      expect(bs).to.exist;
      expect(bs.length).to.equal(1);
      expect(bs[0].innerText).to.equal('Hello ha');

    });

  });

});
