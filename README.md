# Node based ecr login

An equivalent to `eval (aws ecr get-login --no-include-email)`
in nodejs form.

# Why?

Mainly for CI and CD integrations rather installing the aws cli every time, if you have nodejs handy you could use this program.

The size of this library is also kept small by not using `aws-sdk` and this library is
about 200kb in size.

# Installation

## Globally

`npm i -g aws-ecr-login`

## Locally

`npm i aws-ecr-login`

# Usage

In the command line use `ecr-login` or `npx ecr-login`

```
Usage: ecr-login [options]

Options:
  -e, --echo             print to stdout
  -r, --region [region]  aws region (default: "ca-central-1")
  -k, --key [key]        AWS API key. Optional, resolves credentials similar to AWS CLI
  -s, --secret [secret]  AWS API secret key. Optional, resolves credentials similar to AWS CLI
  -h, --help             output usage information
```
