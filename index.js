#!/usr/bin/env node

const aws4 = require('aws4');
const commander = require('commander');
const { spawn } = require('child_process');
const awscred = require('awscred');
const https = require('https');

awscred.load(async (err, { credentials }) => {
  commander
    .option('-e, --echo', 'print to stdout', false)
    .option('-r, --region [region]', 'aws region', 'ca-central-1')
    .option('-k, --key [key]', 'aws api key in ENV or config')
    .option('-s, --secret [secret]', 'aws api key secret in ENV or config')
    .parse(process.argv);

  if (err) throw err;
  const opts = {
    service: 'ecr',
    region: commander.region || 'ca-central-1',
    signQuery: false,
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target':
        'AmazonEC2ContainerRegistry_V20150921.GetAuthorizationToken',
    },
    body: '{}',
    path: '/',
  };

  const sign = aws4.sign(opts, {
    accessKeyId: commander.key || credentials.accessKeyId,
    secretAccessKey: commander.secret || credentials.secretAccessKey,
  });

  const res = await new Promise(resolve => {
    const req = https.request(
      {
        hostname: sign.hostname,
        port: 443,
        method: sign.method,
        path: sign.path,
        headers: sign.headers,
      },
      r => {
        var body = '';
        r.on('data', function(chunk) {
          body = body + chunk;
        });

        r.on('end', function() {
          resolve(JSON.parse(body));
        });
      }
    );
    req.write(sign.body);
    req.end();
  });
  const { authorizationData } = res;
  const [user, pass] = Buffer.from(
    authorizationData[0].authorizationToken,
    'base64'
  )
    .toString()
    .split(':');
  const proxyEndpoint = authorizationData[0].proxyEndpoint;

  const command = ['login', '-u', user, '-p', pass, proxyEndpoint];
  if (commander.echo) {
    console.log('docker ' + command.join(' '));
  } else {
    const child = spawn('docker', command);
    child.stdout.pipe(process.stdout);
  }
});
