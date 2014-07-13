'use strict';

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

window.DB = {
  open: function (collection) {
    var c = new Collection();
    c.KEY = collection;
    return c;
  }
};

function Collection () {

}

Collection.prototype.drop = function () {
  localStorage.removeItem(this.KEY);
};

Collection.prototype._match = function (query, doc) {
  for(var j in query) {
    if (doc[j] !== query[j]) {
      return false;
    }
  }
  return true;
};

Collection.prototype._apply = function (doc, op) {
  var i;
  if (op.$set) {
    for(i in op.$set) {
      if (op.$set.hasOwnProperty(i)) {
        doc[i] = op.$set[i];
      }
    }
  }
  if (op.$inc) {
    for(i in op.$inc) {
      if (op.$set.hasOwnProperty(i)) {
        doc[i] = doc[i] || 0;
        doc[i] += op.$inc[i];
      }
    }
  }
  if (op.$push) {
    for(i in op.$push) {
      if (op.$set.hasOwnProperty(i)) {
        doc[i] = doc[i] || [];
        doc[i].push(op.$push[i]);
      }
    }
  }
  if (op.$pushAll) {
    for(i in op.$pushAll) {
      if (op.$set.hasOwnProperty(i)) {
        doc[i] = doc[i] || [];
        var all = op.$pushAll[i];
        for(var j = 0; j < all.length; j++) {
          doc[i].push(all[j]);
        }
      }
    }
  }
};

Collection.prototype.find = function (query, done) {
  done(null, JSON.parse(localStorage[this.KEY] || '[]')
  .filter(this._match.bind(this, query)));
};

Collection.prototype.findOne = function (query, done) {
  var n = JSON.parse(localStorage[this.KEY] || '[]');
  for(var i = 0; i < n.length; i++) {
    if (this._match(query, n[i])) return done(null, n[i]);
  }
  done(null);
};

Collection.prototype.insert = function (obj, done) {
  var n = JSON.parse(localStorage[this.KEY] || '[]');
  obj._id = obj._id || guid();
  n.push(obj);
  localStorage[this.KEY] = JSON.stringify(n);
  done(null);
};

Collection.prototype.update = function (query, updates, options, done) {
  var n = JSON.parse(localStorage[this.KEY] || '[]');
  if (options.multi) {
    var c = 0;
    n.forEach(function (doc) {
      if (this._match(query, doc)) {
        c++;
        this._apply(doc, updates);
      }
    });
    localStorage[this.KEY] = JSON.stringify(n);
    done(null, c);
    return;
  }
  for(var i = 0; i < n.length; i++) {
    if (this._match(query, n[i])) {
      this._apply(n[i], updates);
      localStorage[this.KEY] = JSON.stringify(n);
      return done(null, 1);
    }
  }
  return done(null, 0);
};