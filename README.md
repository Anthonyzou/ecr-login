# Node base ecr login

An equivalent to `eval (aws ecr get-login --no-include-email)`
in nodejs form.

# Why?

Mainly for CI and CD integrations rather than include this in your codebase
or install the aws cli everytime, if you have nodejs handy you could use this script.

# Usage

```
Usage: ecr-login [options]

Options:
-e, --echo print to stdout
-r, --region [region] aws region (default: "ca-central-1")
-k, --key [key] aws api key
-s, --secret [secret] aws api key secret
-h, --help output usage information
```
