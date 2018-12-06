#!/usr/bin/env node

const AWS = require('aws-sdk');
const commander = require('commander');
const { spawn } = require('child_process');

commander
  .option('-e, --echo', 'print to stdout', false)
  .option('-r, --region [region]', 'aws region', 'ca-central-1')
  .option('-k, --key [key]', 'aws api key')
  .option('-s, --secret [secret]', 'aws api key secret')
  .parse(process.argv);

const ecr = new AWS.ECR({
  apiVersion: '2015-09-21',
  region: commander.region,
  ...(commander.key &&
    commander.secret && {
      accessKeyId: commander.key,
      secretAccessKey: commander.secret,
    }),
});

ecr
  .getAuthorizationToken()
  .promise()
  .then(({ authorizationData }) => {
    if (
      !authorizationData ||
      !authorizationData[0] ||
      !authorizationData[0].authorizationToken
    ) {
      throw new Error('AWS getAuthorizationToken failed');
    }
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
