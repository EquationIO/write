'use strict';

function Document() {
  this.list = document.createElement('ul');
  this.lines = [];
}

/** @type {Boolean} if true, doc.add() will call doc.focus() */
Document.prototype.shouldFocusAutomatically = true;

Document.prototype.serialize = function () {
  return {
    _id: this._id,
    lines: this.lines.map(function (line) {
      return {latex: line.latex()};
    }),
    title: this.titleNode.value
  };
};
Document.open = function (obj) {
  var doc = new Document();
  doc.title = obj.title;
  doc._id = obj._id;
  
  (obj.lines || []).forEach(function (line) {
    doc.add(line);
  });

  return doc;
};

Document.prototype.add = function (contents, sibling) {
  var item = document.createElement('li');
  item.classList.add('item');
  var f = new MathField();

  var doc = this;
  f.onenter = function () {
    doc.add(null, item);
  };
  f.ondelete = function () {
    var index = doc.lines.indexOf(f);
    if (index === 0) return;
    doc.lines.splice(index, 1);
    doc.list.removeChild(item);
    doc.lines[index-1].focus();
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
  f.onchange = function () {
    if (doc.onchange) doc.onchange.call(doc);
  };
  f.present(item);
  if (this.shouldFocusAutomatically) {
    f.focus();    
  }
  if (sibling) {
    insertAfter(sibling, item);
  } else {
    doc.list.appendChild(item);
  }
  
  doc.lines.push(f);

  if (contents && contents.latex) {
    f.setLatex(contents.latex);
  }
};

Document.prototype.present = function (container) {
  container.appendChild(this.list);
};

function insertAfter(sibling, child) {
  if (sibling.nextSibling) {
    sibling.parentNode.insertBefore(child, sibling.nextSibling);
  } else {
    sibling.parentNode.appendChild(child);
  }
}
