const join = require('path').join;
const objectPath = require('object-path');
const merge = require('deepmerge');
const parsers = require('./parsers');

/**
 * Simple file configuration loader
 * @class Config
 */
class Config {
  /**
   * Constructs an instance of Config
   * @constructor
   * @param {String} envPrefix       Environment variable prefix
   * @param {String} envKeyReplacer  Environment key path replacer
   */
  constructor(envPrefix, envKeyReplacer) {
    this.frozen = false;
    this.defaults = {};
    this.file = {};
    this.envs = {};
    this.data = {};
    this.envPrefix = envPrefix || '';
    this.envKeyReplacer = envKeyReplacer || '_';
  }

  /**
   * Merges config from all sources and freezes the config object
   * @method freeze
   */
  freeze() {
    if (!this.frozen) {
      this.data = merge.all([
        this.defaults,
        this.file,
        this.envs,
      ]);
      Object.freeze(this.data);
      this.frozen = true;
    }
  }

  /**
   * Lookup key in config
   * @param {String} key
   * @return {*} key value from config
   */
  get(key) {
    this.freeze();
    return objectPath.get(this.data, key);
  }

  /**
   * Determine if key has value
   * @param {String} key
   * @return {Boolean} whether the config key is present
   */
  has(key) {
    this.freeze();
    return objectPath.has(this.data, key);
  }

  /**
   * Set default value for config key
   * @param {String} key  Config key to set
   * @param {*} value     Default value
   */
  setDefault(key, value) {
    objectPath.set(this.defaults, key, value);
    return this;
  }

  /**
   * Bind specific config key to ENV variable
   * @param {String} key
   */
  bindEnv(key) {
    const envKey = toEnvKey(key, this.envPrefix, this.envKeyReplacer)
    const value = process.env[envKey];
    objectPath.set(this.envs, key, value);
    return this;
  }

  /**
   * Bind env vars that match configured prefix
   * @method autoEnv
   */
  autoEnv() {
    const envs = Object.keys(process.env)
      .filter((env, i) => env
        .toLowerCase()
        .startsWith(this.envPrefix.toLowerCase()))
      .reduce((acc, env) => {
        const configKey = fromEnvKey(env, this.envPrefix, this.envKeyReplacer);
        objectPath.set(acc, configKey, process.env[env]);
        return acc;
      }, {});
    this.envs = envs;
    return this;
  }

  /**
   * Load config data from file
   * @param {*} path
   * @param {*} format
   */
  static fromFile(path, format) {
    path = join(process.cwd(), path);
    const config = new Config();
    switch (format) {
      case 'toml':
        config.file = parsers.toml(path);
        break;
      default:
        config.file = parsers.json(path);
    }
    return config;
  }
}
module.exports = Config;

/**
 * Convert config key to env var
 * @param {String} key       Config key
 * @param {String} prefix    Prefix for env vars
 * @param {String} replacer  Env var separator char
 * @return {String} env key
 */
function toEnvKey(key, prefix, replacer) {
  key = key.toUpperCase()
    .replace('.', replacer);
  prefix = prefix.toUpperCase();
  return `${prefix}${replacer}${key}`;
}

/**
 * Convert env var to config key
 * @param {String} env       Environment variable
 * @param {String} prefix    Prefix for env vars
 * @param {String} replacer  Env var separator char
 * @return {String} config key
 */
function fromEnvKey(env, prefix, replacer) {
  prefix = prefix.toLowerCase();
  return env
    .toLowerCase()
    .replace(prefix+replacer, '')
    .replace(replacer, '.');
}
