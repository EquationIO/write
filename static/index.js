'use strict';

var MathQuill = window.MathQuill;

function MathField() {
  this.element = document.createElement('mathquill');
  var ctrl = this;

  MathQuill.MathField(this.element, {
    handlers: {
      edited: listener,
      enter: handler,
      deleteOutOf: deleteOutOf
    }
  });

  function listener(field) {
    if (!field) return;
    var value = field.latex();
    if (value === ctrl.$viewValue) {
      return;
    }
    ctrl.$viewValue = value;
  }

  function deleteOutOf() {
    ctrl.ondelete();
  }

  function handler() {
    ctrl.onenter();
  }
}

MathField.prototype.setLatex = function (latex) {
  if (latex === this.$viewValue) return;
  var field = new MathQuill(this.element);
  this.$viewValue = latex;
  field.latex(this.$viewValue);
};
MathField.prototype.present = function (container) {
  container.appendChild(this.element);
};
MathField.prototype.focus = function () {
  var field = new MathQuill(this.element);
  setTimeout(function () {
    field.focus();
  }, 0);
};

var list = document.createElement('ul');

var lines = [];

function add() {
  var item = document.createElement('li');
  item.classList.add('item');
  var f = new MathField();
  f.onenter = add;
  f.ondelete = function () {
    var index = lines.indexOf(f);
    if (index === 0) return;
    lines.splice(index, 1);
    list.removeChild(item);
    lines[index-1].focus();
  };
  f.present(item);
  f.focus();
  list.appendChild(item);
  lines.push(f);
}

var main = document.getElementById('main');

main.appendChild(list);

add();