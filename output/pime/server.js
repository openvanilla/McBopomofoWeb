'use strict';

const nime = require('nime');
const fs   = require('fs');
const path = require('path');

const service = require('./index');

const configFile = fs.readFileSync(path.join(process.cwd(), 'ime.json'), 'utf8');
const config = JSON.parse(configFile);

config['textService'] = service;

const server = nime.createServer(undefined, [config]);

server.listen();
