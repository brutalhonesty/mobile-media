'use strict';

module.exports = {
  env: 'test',
  ip:   process.env.OPENSHIFT_NODEJS_IP ||
        process.env.IP ||
        '127.0.0.1',
  port: process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        3000
};