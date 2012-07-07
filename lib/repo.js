/**
 * Module dependencies.
 */

var path = require('path')
  , async = require('async')
  , helper = require('./helper')
  , Git = require('./git');

/**
 * Expose `Repository`.
 */

module.exports = Repo;

/**
 * Initialize a new `Repo` with the given `path`, `origin` URL and `treeish` ref.
 *
 * @param {String} path
 * @param {String} origin
 * @param {String} treeish
 * @api private
 */

function Repo(path, origin, treeish) {
  this.path = path;
  this.origin = origin;
  this.git = new Git(path, treeish || 'master');
}

/**
 * Check if the .git repository exists.
 *
 * @return {Boolean}
 * @api private
 */

Repo.prototype.exists = function() {
  return fs.existsSync(path.join(this.path, '.git'));
}

/**
 * Create the repository, add the remote as origin, then fetch,
 * calling `callback` when complete.
 *
 * @param {Function} callback
 * @return {Boolean}
 * @api private
 */

Repo.prototype.create = function(callback) {
  var self = this;
  async.series([
    function(cb) { helper.mkdir(self.path, cb); }
  , function(cb) { self.git.init(cb); }
  , function(cb) { self.git.remoteAdd(self.origin, 'origin', cb); }
  , function(cb) { self.git.fetch('origin', cb); }
  ], callback);
}

/**
 * Create the repository if it doesn't exist, otherwise checkout `branch`.
 *
 * @param {String} branch
 * @param {Function} callback
 * @return {Boolean}
 * @api private
 */

Repo.prototype.checkout = function(branch, callback) {
  var self = this;
  async.series([
    function(cb) { if(self.exists()) { cb(); } else { self.create(cb); } }
  , function(cb) { self.git.checkout(branch, cb); }
  , function(cb) { self.git.reset(branch + ' --hard', cb); }
  ], callback);
}

/**
 * Create the repository if it doesn't exist, otherwise do a hard reset to `treeish`.
 *
 * @param {String} treeish
 * @param {Function} callback
 * @return {Boolean}
 * @api private
 */

Repo.prototype.reset = function(treeish, callback) {
  if(!this.exists()) {
    this.create(callback);
  } else {
    this.git.reset(treeish + ' --hard', callback);
  }
}

/**
 * Create the repository if it doesn't exist, otherwise fetch from origin,
 * calling `callback` when complete.
 *
 * @param {Function} callback
 * @return {Boolean}
 * @api private
 */

Repo.prototype.fetch = function(callback) {
  if(!this.exists()) {
    this.create(callback);
  } else {
    this.git.fetch('origin', callback);
  }
}

/**
 * Assert that the repo exists
 *
 */

Repo.prototype.assertExists = function() {
  if(!this.exists()) {
    throw new Error('Repo not initialized at ' + this.path + '.');
  }
}