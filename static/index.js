'use strict';

var HAS_ACCEPTED_WELCOME = 'HAS_ACCEPTED_WELCOME';

var isFirstRun = !localStorage[HAS_ACCEPTED_WELCOME];
var welcomeDiv = document.getElementById('welcome');

document.getElementById('welcomedone').addEventListener('click', function () {
  welcomeDiv.style.display = 'none';
  isFirstRun = false;
  localStorage[HAS_ACCEPTED_WELCOME] = new Date().toISOString();

  // Focus on the first line of the presented document:
  if (present.presenter) {
    var line = present.presenter.lines[0];
    if (line) line.focus();
  }
});

if (isFirstRun) {
  welcomeDiv.style.display = 'block';
}

var documents = DB.open('io.equation.write.documents');

function refreshDocuments() {
  var dlist = document.getElementById('documents-list');
  documents.find({}, function (err, docs) {
    if (err) throw err;
    while(dlist.firstChild) {
      dlist.removeChild(dlist.firstChild);
    }

    docs.forEach(function (doc) {
      if (!doc._id) return;
      var li = document.createElement('li');
      li.setAttribute('value', doc._id);
      li.appendChild(document.createTextNode(doc.title || 'Untitled'));
      dlist.appendChild(li);
    });
  });
}

function save(obj, isNew, done) {
  if (isNew) {
    documents.insert(obj, done);
  } else {
    documents.update({_id: obj._id}, {$set: obj}, {}, function (err, changed) {
      if (err) throw err;
      if (!changed) {
        return done(new Error('Not found'));
      }
      return done(null);
    });
  }
}

window.onkeydown = function (e) {
  if (e.keyCode === 83 && (e.ctrlKey || e.metaKey)) {
    var doc = present.presenter;
    e.preventDefault();

    if (doc.__saving) return;
    doc.__saving = true;

    var s = doc.serialize();
    var isNew = !s._id;
    s._id = s._id || guid();
    doc._id = s._id;
    save(s, isNew, function (err) {
      delete doc.__saving;
      if (err) throw err;

      refreshDocuments();
    });
  }
};

var presenter = document.getElementById('document-presenter');

function openNew (){
  var doc = new Document();

  if (isFirstRun) {
    doc.shouldFocusAutomatically = false;
  }

  doc.add();

  present(doc);
}

function present(doc) {
  while(presenter.firstChild) {
    presenter.removeChild(presenter.firstChild);
  }
  doc.titleNode = document.getElementById('doc_title');
  doc.titleNode.value = doc.title || '';
  doc.present(presenter);

  if (present.presenter) {
    present.presenter.onchange = null;
  }

  doc.onchange = function () {
    if (doc.__saving) return;

    var s = doc.serialize();
    var isNew = !s._id;
    s._id = s._id || guid();
    doc._id = s._id;
    doc.__saving = true;
    save(s, isNew, function (err) {
      delete doc.__saving;
      if (err) throw err;
    });

  };

  present.presenter = doc;
}

openNew();

var docselector = document.getElementById('document-selector');
docselector.onselect = function () {
  var v = docselector.value;
  if (v === 'new') {
    openNew();
  } else if (v === 'about') {
    welcomeDiv.style.display = 'block';
  } else {
    documents.findOne({_id: v}, function (err, obj) {
      if (err) throw err;
      if (!obj) throw new Error('Not Found');
      var doc = Document.open(obj);
      doc.titleNode = document.getElementById('doc_title');
      present(doc);
    });
  }
};

refreshDocuments();


[].forEach.call(document.getElementsByTagName('popdown'), function (popdown) {
  var overlay = document.createElement('div');
  overlay.classList.add('popdown-overlay');
  popdown.appendChild(overlay);

  popdown.onclick = function (e) {
    if(e.srcElement.classList.contains('button')) {
      popdown.classList.add('active');
      return;
    }
    if (e.srcElement === overlay) {
      return popdown.classList.remove('active');
    }
    var node = e.srcElement;
    do {
      if (node.nodeName === 'LI') {
        break;
      }
    } while ((node = node.parentNode));
    if (node && node.nodeName === 'LI') {
      var v = node.getAttribute('value');
      popdown.value = v;
      if (popdown.onselect) popdown.onselect();
      return popdown.classList.remove('active');
    }

  };

});