# Simple Config

[![Build Status](https://travis-ci.org/thisissoon/node-simple-config.svg?branch=master)](https://travis-ci.org/thisissoon/node-simple-config)

Simple file based configuration with environment variable overrides.

## Quick Start

This example uses [toml](https://github.com/toml-lang/toml) format, but
configurations can be in other [file formats](#file-formats).

### Install and create config file

```sh
$ npm install https://github.com/thisissoon/node-simple-config
$ npm install toml
$ vi config.toml
```

```toml
[http]
host = "0.0.0.0"
port = 4000
```

### Use config in your code
```js
const Config = require('simple-config');
const myConfig = Config.fromFile('config.toml', 'toml');

myConfig.get('http.host'); // 0.0.0.0
myConfig.get('http.port'); // 4000

myConfig.has('http.port'); // true
```

## Environment Overrides

Environment variables can be used to override config values from files.

**Bind individual config keys to env vars**
```sh
MYAPP_HTTP_PORT=5000
```
```js
const Config = require('simple-config');
const myConfig = Config.fromFile('config.toml', 'toml');
myConfig.envPrefix = 'MYAPP';

config.bindEnv('http.port');

myConfig.get('http.port'); // 5000
```

`http.port` is bound to the env var `MYAPP_HTTP_PORT`.

**Automatically bind matching env vars**
```sh
MYAPP_HTTP_PORT=5000
MYAPP_HTTP_HOST=127.0.0.1
```
```js
const Config = require('simple-config');
const myConfig = Config.fromFile('config.toml', 'toml');
myConfig.envPrefix = 'MYAPP';

config.autoEnv();

myConfig.get('http.port'); // 5000
myConfig.get('http.host'); // 127.0.0.1
```

**The prefix and the path replacer can be configured:**
```sh
AWESOME-HTTP-PORT=5000
```
```js
myConfig.envPrefix = 'AWESOME';
myConfig.envKeyReplacer = '-';
```


## Defaults

An application should set sane default values if a config option is
not provided.

```js
const Config = require('simple-config');
const myConfig = Config.fromFile('config.toml', 'toml');
myConfig.setDefault('http.host', '127.0.0.1');
myConfig.setDefault('http.port', 5000);
myConfig.setDefault('http.root', '/api');

myConfig.get('http.host'); // 0.0.0.0
myConfig.get('http.port'); // 4000
myConfig.get('http.root'); // /api
```

## File formats

### JSON
```js
const myConfig = Config.fromFile('config.json');
```

### TOML

The toml parser is not included in the dependencies as its optional,
you'll need to install it if you're using toml.

```
$ npm install toml
```
```js
const myConfig = Config.fromFile('config.toml', 'toml');
```
