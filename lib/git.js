/**
 * Module dependencies.
 */

var path = require('path')
  , exec = require('child_process').exec
  , helper = require('./helper');

/**
 * Expose `Git`.
 */

module.exports = Git;

/**
 * Initialize `Git` with the given `path` and `treeish` ref.
 *
 * @param {String} path
 * @param {String} treeish
 * @api private
 */

function Git(path, treeish) {
  this.path = path;
  this.head = treeish || 'master';
  this.remote = 'origin';
}

/**
 * Execute given `cmd` at the current path,
 * calling `cb` when complete.
 *
 * @param {String} cmd
 * @param {Function} cb
 * @api private
 */

Git.prototype.exec = function(cmd, cb) {
  var command = 'git ' + cmd;
  helper.log(command, 'exec');
  helper.exec(command, { cwd: this.path }, cb);
}

/**
 * Init the repository in the current path,
 * calling `cb` when complete.
 *
 * @param {Function} cb
 * @api private
 */

Git.prototype.init = function(cb) {
  this.exec('init .', cb);
}

/**
 * Add a remote repository called `remote`
 * located at `url`, calling `cb` when complete.
 *
 * @param {String} url
 * @param {String} name
 * @param {Function} cb
 * @api private
 */

Git.prototype.remoteAdd = function(url, name, cb) {
  this.exec('remote add ' + (name || this.remote) + ' ' + url, cb);
}

/**
 * Fetch from the given `remote` repository,
 * calling `cb` when complete.
 *
 * @param {String} remote
 * @param {Function} cb
 * @api private
 */

Git.prototype.fetch = function(remote, cb) {
  this.exec('fetch ' + (remote ||  this.remote), cb);
}

/**
 * Checkout the tree at given `ref`, calling `cb`
 * when complete.
 *
 * @param {String} treeish
 * @param {Function} cb
 * @api private
 */

Git.prototype.checkout = function(treeish, cb) {
  if(treeish) { this.head = treeish; }
  this.exec('checkout ' + this.head, cb);
}

/**
 * Reset the tree to given `ref`, calling `cb`
 * when complete.
 *
 * @param {String} treeish
 * @param {Function} cb
 * @api private
 */

Git.prototype.reset = function(treeish, cb) {
  this.exec('reset ' + treeish, cb);
}

/**
 * Get rev-list
 *
 * @param {String} treeish
 * @param {Function} cb
 * @api private
 */

Git.prototype.revList = function(treeish, cb) {
  this.exec('rev-list ' + treeish, cb);
}

/**
 * Parse treeish to rev
 *
 * @param {String} treeish
 * @param {Function} cb
 * @api private
 */

Git.prototype.revParse = function(treeish, cb) {
  this.exec('rev-parse --verify ' + treeish, cb);
}