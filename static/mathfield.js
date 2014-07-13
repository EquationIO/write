
var MathQuill = window.MathQuill;

function MathField() {
  this.element = document.createElement('mathquill');
  var ctrl = this;

  MathQuill.MathField(this.element, {
    handlers: {
      edited: listener,
      enter: handler,
      deleteOutOf: deleteOutOf,
      moveOutOf: function () { console.log('moveOutOf');},
      selectOutOf: function () { console.log('selectOutOf');},
      upOutOf: upOutOf,
      downOutOf: downOutOf
    }
  });

  function listener(field) {
    if (!field) return;
    var value = field.latex();
    if (value === ctrl.$viewValue) {
      return;
    }
    ctrl.$viewValue = value;
    if (ctrl.onchange) ctrl.onchange.call(ctrl);
  }

  function deleteOutOf() {
    ctrl.ondelete.call(ctrl);
  }

  function handler() {
    ctrl.onenter.call(ctrl);
  }

  function upOutOf() {
    ctrl.onup.call(ctrl);
  }

  function downOutOf() {
    ctrl.ondown.call(ctrl);
  }
}

MathField.find = function (element) {
  var e = Object.create(MathField.prototype);
  e.element = element;
  return e;
};

MathField.prototype.setLatex = function (latex) {
  if (latex === this.$viewValue) return;
  var field = new MathQuill(this.element);
  this.$viewValue = latex;
  field.latex(this.$viewValue);
};
MathField.prototype.present = function (container) {
  container.appendChild(this.element);
};
MathField.prototype.latex = function () {
  return new MathQuill(this.element).latex();
};
MathField.prototype.focus = function () {
  var field = new MathQuill(this.element);
  setTimeout(function () {
    field.focus();
  }, 0);
};
