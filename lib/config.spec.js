const assert = require('assert');
const Config = require('./config');

describe('Config', () => {
  it('should construct instance', () => {
    const config = new Config();
    assert.equal(config.frozen, false);
    assert.deepEqual(config.defaults, {});
    assert.deepEqual(config.file, {});
    assert.deepEqual(config.envs, {});
    assert.deepEqual(config.data, {});
  });

  it('should determine existence of config value', () => {
    const config = new Config();
    config.setDefault('http.port', 5000);
    assert.equal(config.has('http.port'), true);
    assert.equal(config.has('http.root'), false);
  });

  it('should freeze config', () => {
    const config = new Config();
    config.setDefault('http.port', 5000);
    config.freeze();
    assert.equal(config.frozen, true);
    config.data.port = 4000;
    assert.equal(config.get('http.port'), 5000);
  });

  describe('defaults', () => {
    it('should set defaults', () => {
      const config = new Config();
      config.setDefault('http.root', '/');
      config.setDefault('http.port', 5000);

      assert.equal(config.get('http.root'), '/');
      assert.equal(config.get('http.port'), 5000);
    });

    it('should override defaults', () => {
      const config = Config.fromFile('config.json');
      config.setDefault('http.host', '127.0.0.1');
      config.setDefault('http.port', 5000);
      config.setDefault('http.root', '/');

      assert.equal(config.get('http.root'), '/');
      assert.equal(config.get('http.host'), '0.0.0.0');
      assert.equal(config.get('http.port'), 4000);
    });
  });

  describe('fromFile', () => {
    it('should default parser to json', () => {
      const config = Config.fromFile('config.json');
      assert.equal(config.get('http.host'), '0.0.0.0');
      assert.equal(config.get('http.port'), 4000);
    });

    it('should load from json', () => {
      const config = Config.fromFile('config.json', 'json');
      assert.equal(config.get('http.host'), '0.0.0.0');
      assert.equal(config.get('http.port'), 4000);
    });

    it('should load from toml', () => {
      const config = Config.fromFile('config.toml', 'toml');
      assert.equal(config.get('http.host'), '0.0.0.0');
      assert.equal(config.get('http.port'), 4000);
    });

    it('should fallback to defaults without file', () => {
      const config = Config.fromFile('notexists.json');
      config.setDefault('http.host', '127.0.0.1');
      assert.equal(config.get('http.host'), '127.0.0.1');
    });

    it('should throw err for unknown format', () => {
      assert.throws(() => {
        Config.fromFile('config.json', 'yaml');
      });
    });
  });

  describe('addParser', () => {
    it('should add custom parser', () => {
      const config = new Config();
      config.addParser('custom', (data) => JSON.parse(data));
      config.fromFile('config.json', 'custom');
      assert.equal(config.get('http.host'), '0.0.0.0');
    });
  });

  describe('bindEnv', () => {
    before(() => {
      process.env.PREFIX_HTTP_HOST = 'localhost';
    });

    it('should bind env var to config key', () => {
      const config = new Config('PREFIX');
      config.bindEnv('http.host');
      assert.equal(config.get('http.host'), 'localhost');
    });
  });

  describe('autoEnv', () => {
    before(() => {
      process.env.PREFIX_HTTP_HOST = 'localhost';
    });

    it('should override defaults', () => {
      const config = new Config('PREFIX');
      config.setDefault('http.host', '0.0.0.0');
      config.autoEnv();
      assert.equal(config.get('http.host'), 'localhost');
    });

    it('should be case insensitive', () => {
      const config = new Config('prefix');
      config.setDefault('http.host', '0.0.0.0');
      config.autoEnv();
      assert.equal(config.get('http.host'), 'localhost');
    });

    it('should override file values', () => {
      const config = Config.fromFile('config.json');
      config.envPrefix = 'PREFIX';
      config.autoEnv();
      assert.equal(config.get('http.host'), 'localhost');
    });
  });
});
