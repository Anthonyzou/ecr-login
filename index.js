#!/usr/bin/env node

const aws4 = require('aws4');
const commander = require('commander');
const { spawn } = require('child_process');
const awscred = require('awscred');
const axios = require('axios');


awscred.load(async (err, { credentials }) => {
  commander
    .option('-e, --echo', 'print to stdout', false)
    .option('-r, --region [region]', 'aws region', 'ca-central-1')
    .option('-k, --key [key]', 'aws api key', credentials.accessKeyId)
    .option('-s, --secret [secret]', 'aws api key secret', credentials.secretAccessKey)
    .parse(process.argv);

  if (err) throw err;
  const opts = {
    service: 'ecr',
    region: 'ca-central-1',
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
    accessKeyId: commander.key,
    secretAccessKey: commander.secret,
  });
  const res = await axios({
    url: `https://${sign.hostname}/`,
    method: sign.method,
    path: sign.path,
    headers: sign.headers,
    data: sign.body,
  });
  const { authorizationData } = res.data;
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
