/**
 * Module dependencies.
 */

var path = require('path')
  , helper = require('./helper')
  , Repo = require('./repo')
  , Build = require('./build');

/**
 * Expose `Branch`.
 */

module.exports = Branch;

/**
 * Initialize a new `Branch` with the given `name` and `project` (as parent).
 *
 * @param {String} name
 * @param {Project} project
 * @api private
 */

function Branch(name, project) {
  if(name instanceof Branch) { return name; }

  assertIsProject(project);

  this.project = project;

  this.ref = name;
  this.name = project.name + '@' + name;

  this.path = path.join(project.path, this.ref);
  this.sourcePath = path.join(this.path, 'source');
  this.buildsPath = path.join(this.path, 'builds');
  this.repo = new Repo(this.sourcePath, this.project.config.repository);
}

/**
 * Check if the branch directory exists.
 *
 * @return {Boolean}
 * @api private
 */

Branch.prototype.exists = function() {
  return path.existsSync(this.sourcePath);
}

/**
 * Create needed directories and checkout the source,
 * calling the `cb` function when complete.
 *
 * @param {Function} cb
 * @return {this}
 * @api private
 */

Branch.prototype.checkout = function(cb) {
  var self = this;
  helper.mkdir(this.path, function() {
    helper.mkdir(self.sourcePath);
    helper.mkdir(self.buildsPath);
    self.repo.checkout(self.ref, function(err, data) {
      return cb && cb(err, self);
    });
  });

  return this;
}

/**
 * Return a `Build` for this branch at the given `ref`.
 *
 * @param {String} ref
 * @return {Build}
 * @api private
 */

Branch.prototype.build = function(ref) {
  this.assertExists();
  return new Build(ref, this);
}

/**
 * Return the status object for the build at the given `ref`.
 *
 * @param {String} ref
 * @return {Build}
 * @api private
 */

Branch.prototype.status = function(ref) {
  return this.build(ref).status;
}

/**
 * Remove the directory for this branch.
 *
 * @api private
 */

Branch.prototype.destroy = function() {
  this.assertExists();
  helper.rmrf(this.path);
}

/**
 * Throw an error if this branch's directory doesn't exist.
 *
 * @api private
 */

Branch.prototype.assertExists = function() {
  if(!this.exists()) {
    throw new Error('Branch "' + this.name + '"' +
                    ' hasn\'t been checked out yet.');
  }
}

/**
 * Get all the branches in the given `project`.
 *
 * @param {Project} project
 * @return {Array}
 * @api private
 */

Branch.all = function(project) {
  assertIsProject(project);

  return helper.lsSync(project.path).map(function(dir) {
    return new Branch(dir.replace(/\-/, '/'), int);
  }).filter(function(branch) {
    return branch.exists();
  });
}

/**
 * Make sure we have an instance of Project.
 * We have to lazy load to avoid circular require issues.
 *
 * @param {Object}
 */

function assertIsProject(instance) {
  if(!(instance instanceof require('./project'))) {
    throw new Error('Parent must be an instance of Project');
  }
}


