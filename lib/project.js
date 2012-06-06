/**
 * Module dependencies.
 */

var path = require('path')
  , helper = require('./helper')
  , Branch = require ('./branch');

/**
 * Expose `Project`.
 */

module.exports = Project;

/**
 * Config defaults.
 */

var configFilename = '.cin.json'
  , configDefaults = {
      repository: null
    , env: {
        "NODE_ENV": "test"
      , "RAILS_ENV": "test"
      }
    , command: 'make test'
    , versions: {
        node: '*'
      , ruby: '*'
      }
    };

/**
 * Initialize `Project` with the given `name` and `cin` (as parent).
 *
 * @param {String} name
 * @param {Cin} cin
 * @api private
 */

function Project(name, cin) {
  if(name instanceof Project) { return name; }

  assertIsCin(cin);

  this.name = parseName(name);
  this.head = parseHead(name);
  this.alias = this.name.split(/\//)[1];

  this.cin = cin;
  this.path = path.join(cin.projectsPath, this.name.replace(/\//, '-'));
  this.configFilePath = path.join(this.path, configFilename);
}

/**
 * Update the config file with the given `attrs`
 *
 * @api private
 */

Project.prototype.__defineSetter__("config", function(attrs) {
  var existing = this.exists() ? this.config : configDefaults;
  this._config = helper.deepMerge(existing, attrs || {});

  helper.writeJSON(this.configFilePath, this._config);
});

/**
 * Return the config attrs.
 *
 * @api private
 */

Project.prototype.__defineGetter__("config", function() {
  this.assertExists();

  return this._config || (this._config = helper.readJSON(this.configFilePath));
});

/**
 * Check if the project (config file) exists.
 *
 * @return {Boolean}
 * @api private
 */

Project.prototype.exists = function() {
  return path.existsSync(this.configFilePath);
}

/**
 * Create the project with given `options` and attempt to checkout
 * the initial branch. If it fails, we cleanup. Call `cb` when complete.
 *
 * @param {Object} options
 * @param {Function} cb
 * @return {this}
 * @api private
 */

Project.prototype.create = function(options, cb) {
  if(this.exists()) {
    this.branch().checkout(function(err) {
      return cb && cb(err, self);
    });

    return this;
  }

  var projectOpts = helper.merge({
    alias: this.alias,
    repository: "git@github.com:" + this.name + ".git"
  }, options);

  var self = this;
  helper.mkdir(this.path, function() {
    self.config = projectOpts;
    // try checking out head at least
    self.branch().checkout(function(err) {
      if(err) {
        // if checkout fails, clean up
        self.destroy();
      }
      return cb && cb(err, self);
    });
  });

  return this;
}

/**
 * Return a Branch for this project with the given `name`.
 *
 * @param {String} name
 * @return {Branch}
 * @api private
 */

Project.prototype.branch = function(name) {
  this.assertExists();
  return new Branch(name || this.head, this);
}

/**
 * Return a Build for this project in the current branch at the given 'ref'.
 *
 * @param {String} ref
 * @return {Build}
 * @api private
 */

Project.prototype.build = function(ref) {
  return this.branch().build(ref);
}

/**
 * Remove the directory for this project.
 *
 * @api private
 */

Project.prototype.destroy = function() {
  this.assertExists();
  helper.rmrf(this.path);
}

/**
 * Throw an error if this project's directory doesn't exist.
 *
 * @api private
 */

Project.prototype.assertExists = function() {
  if(!this.exists()) {
    throw new Error('Project "' + this.name + '" doesn\'t exist.');
  }
}

/**
 * Get all the projects in the given `cin` directory.
 *
 * @param {Cin} cin
 * @return {Array}
 * @api private
 */

Project.all = function(cin) {
  assertIsCin(cin);

  return helper.lsSync(cin.projectsPath).map(function(dir) {
    return new Project(dir.replace(/\-/, '/'), cin);
  }).filter(function(project){
    return project.exists();
  });
}

/**
 * Parse project name or url.
 *
 */

function parseName(name) {
  name = name.split('@')[0];
  name = name.replace(/(https:\/\/|http:\/\/|git:\/\/|git@)?github\.com(\/|:)|\.git/g, '');
  if (!name.match(/^[\w\-_]+\/[\w\-_]+$/)) {
    throw new Error('"' + name + '" isn\'t a valid project name.');
  }
  return name;
}

/**
 * Parse Git branch name from project name.
 *
 */

function parseHead(name) {
  return name.split('@')[1] || 'master';
}

/**
 * Make sure we have an instance of Cin.
 * We have to lazy load to avoid circular require issues.
 *
 */

function assertIsCin(instance) {
  if(!(instance instanceof require('./cin'))) {
    throw new Error('Parent must be an instance of Cin');
  }
}


