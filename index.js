#!/usr/bin/env node

var aws4 = require('aws4');
var { Command } = require('commander');
var { spawn } = require('child_process');
var awscred = require('awscred');
var https = require('https');

const options = new Command()
  .option('-e, --echo', 'print to stdout', false)
  .option('-r, --region [region]', 'aws region', 'ca-central-1')
  .option(
    '-k, --key [key]',
    'AWS API key. Optional, resolves credentials similar to AWS CLI'
  )
  .option(
    '-s, --secret [secret]',
    'AWS API secret key. Optional, resolves credentials similar to AWS CLI'
  )
  .parse(process.argv)
  .opts();

awscred.load(function (err, { credentials }) {
  if (err) throw err;

  var opts = {
    service: 'ecr',
    region: options.region,
    signQuery: false,
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target':
        'AmazonEC2ContainerRegistry_V20150921.GetAuthorizationToken',
    },
    body: '{}',
    path: '/',
  };

  var sign = aws4.sign(opts, {
    // dont use in commander defaults since it can show secrets when showing help
    accessKeyId: options.key || credentials.accessKeyId,
    secretAccessKey: options.secret || credentials.secretAccessKey,
  });

  new Promise(function (resolve) {
    var req = https.request(
      {
        hostname: sign.hostname,
        port: 443,
        method: sign.method,
        path: sign.path,
        headers: sign.headers,
      },
      function (r) {
        var body = '';
        r.on('data', function (chunk) {
          body = body + chunk;
        });

        r.on('end', function () {
          resolve(JSON.parse(body));
        });
      }
    );
    req.write(sign.body);
    req.end();
  }).then(function (res) {
    var { authorizationData } = res;
    var [user, pass] = Buffer.from(
      authorizationData[0].authorizationToken,
      'base64'
    )
      .toString()
      .split(':');
    var proxyEndpoint = authorizationData[0].proxyEndpoint;

    var command = ['login', '-u', user, '-p', pass, proxyEndpoint];
    if (options.echo) {
      console.log('docker ' + command.join(' '));
    } else {
      var child = spawn('docker', command);
      child.stdout.pipe(process.stdout);
    }
  });
});
