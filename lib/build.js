/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , helper = require('./helper');

/**
 * Expose `Build`.
 */

module.exports = Build;

/**
 * Status file.
 */

var statusFilename = 'status.json'
  , statusDefaults = {
      running: false
    , lastRunAt: null
    , success: false
    };

/**
 * Initialize a new `Build` with the given `ref` and `branch` (as parent).
 *
 * @param {String} name
 * @param {Branch} branch
 * @api private
 */

function Build(ref, branch) {
  if(ref instanceof Build) { return ref; }

  assertIsBranch(branch);

  if(!ref) { ref = 'HEAD'; }

  this.branch = branch;
  this.project = branch.project;

  this.isHead = ref == 'HEAD';
  this.ref = this.isHead ? 'HEAD' : ref;
  this.name = this.project.name + '@' + (this.isHead ? branch.ref : ref);

  this.path = path.join(branch.buildsPath, this.ref);
  this.statusFilePath = path.join(this.path, statusFilename);
  this.process = null;
}

/**
 * Update the status file with the given `attrs`
 *
 * @api private
 */

Build.prototype.__defineSetter__("status", function(attrs) {
  this._status = helper.merge(this._status || statusDefaults, attrs || {});

  var self = this
  if(this.exists()) {
    helper.writeJSON(self.statusFilePath, self._status);
  } else {
    helper.mkdir(this.path, function() {
      helper.writeJSON(self.statusFilePath, self._status);
    });
  }
});

/**
 * Return the build status attrs, initializing them if needed.
 *
 * @api private
 */

Build.prototype.__defineGetter__("status", function() {
  if(!this.exists()) { this.status = {}; return this._status; }

  return this._status || (this._status = helper.readJSON(this.statusFilePath));
});

/**
 * Check if the build (status file) exists.
 *
 * @return {Boolean}
 * @api private
 */

Build.prototype.exists = function() {
  return path.existsSync(this.statusFilePath);
}

/**
 * Run given `command` in the branch's directory, calling `cb` when complete.
 *
 * @param {String} command
 * @param {Function} cb
 *
 * @return {Process}
 * @api private
 */

Build.prototype.exec = function(command, cb) {
  helper.log(command, 'exec');
  return helper.exec(command, { cwd: this.branch.repo.path }, cb);
}

/**
 * Reset the branch repo to this build's ref, then execute the project
 * build command in the branch's directory, calling `cb` when complete.
 *
 * @param {Function} cb
 *
 * @return {this}
 * @api private
 */

Build.prototype.run = function(cb) {
  this.assertNotRunning();

  var command = this.project.config.command;
  if(!command) {
    throw new Error('no build command set');
  }

  var self = this;
  this.branch.repo.reset(this.ref, function(err) {
    if(err) {
      if(cb) { return cb(err); }
      throw err;
    }

    helper.log(self.name, 'building');

    self.status = { running: true };

    self.process = self.exec(command, function(err) {
      if (err) { helper.log(err, '>'); }

      self.status = { running: false, lastRunAt: new Date(), success: !err };

      if(cb) { cb(null, self.status); }
    });

    var buildLog = fs.createWriteStream(path.join(self.path, 'build.log'));
    self.process.stdout.pipe(buildLog);
    self.process.stderr.pipe(buildLog);

    self.process.on('exit', function() {
      self.process = null;
    });

    process.on('SIGINT', function() {
      if(self.process) { self.process.kill(); }
    });
  });

  return this;
}

/**
 * Stop the current build if running.
 *
 * @return {this}
 * @api private
 */

Build.prototype.stop = function() {
  if(this.process) { this.process.kill(); }
  helper.log(self.name, 'stopped');
  return this;
}

/**
 * Remove the build directory if not running.
 *
 * @api private
 */

Build.prototype.destroy = function() {
  this.assertExists();
  this.assertNotRunning();

  helper.rmrf(this.path);
}

/**
 * Throw an error if this branch's directory doesn't exist.
 *
 * @api private
 */

Build.prototype.assertExists = function() {
  if(!this.exists()) {
    throw new Error('Build "' + this.name + '" doesn\'t exist.');
  }
}

/**
 * Throw an error if this build is running.
 *
 * @api private
 */

Build.prototype.assertNotRunning = function() {
  if(this.status.running) {
    throw new Error('Build "' + this.name + '" is already running!');
  }
}

/**
 * Get all the builds in the given `branch`.
 *
 * @param {Branch} branch
 * @return {Array}
 * @api private
 */

Build.all = function(branch) {
  assertIsBranch(branch);

  return helper.lsSync(branch.buildsPath).map(function(dir) {
    return branch.build(dir);
  });
}

/**
 * Make sure we have an instance of Branch.
 * We have to lazy load to avoid circular require issues.
 *
 */

function assertIsBranch(instance) {
  if(!(instance instanceof require('./branch'))) {
    throw new Error('Must be an instance of Branc');
  }
}


