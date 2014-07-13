'use strict';

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
MathField.prototype.focus = function () {
  var field = new MathQuill(this.element);
  setTimeout(function () {
    field.focus();
  }, 0);
};

var list = document.createElement('ul');

var lines = [];

function add(sibling) {
  var item = document.createElement('li');
  item.classList.add('item');
  var f = new MathField();
  f.onenter = function () {
    add(item);
  };
  f.ondelete = function () {
    var index = lines.indexOf(f);
    if (index === 0) return;
    lines.splice(index, 1);
    list.removeChild(item);
    lines[index-1].focus();
  };
  f.ondown = function () {
    var next = item.nextSibling;
    if (!next) return;
    var n = MathField.find(next.firstChild);
    n.focus();
  };
  f.onup = function () {
    var prev = item.previousSibling;
    if (!prev) return;
    var n = MathField.find(prev.firstChild);
    n.focus();
  };
  f.present(item);
  f.focus();
  if (sibling) {
    insertAfter(sibling, item);
  } else {
    list.appendChild(item);
  }
  lines.push(f);
}

function insertAfter(sibling, child) {
  if (sibling.nextSibling) {
    sibling.parentNode.insertBefore(child, sibling.nextSibling);
  } else {
    sibling.parentNode.appendChild(child);
  }
}

var main = document.getElementById('main');

main.appendChild(list);

add();