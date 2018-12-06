#!/usr/bin/env node

const AWS = require('aws-sdk');
const commander = require('commander');

commander.option('-r, --region', 'aws region', 'ca-central-1');
commander.option('-k, --key', 'aws api key');
commander.option('-s, --secret', 'aws api key secret');
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

    await childProcessP.spawn('docker', [
      'login',
      '-u',
      user,
      '-p',
      pass,
      proxyEndpoint,
    ]);
  });
