# Node based ecr login

An equivalent to `eval (aws ecr get-login --no-include-email)`
in nodejs form.

# Why?

Mainly for CI and CD integrations rather installing the aws cli every time, if you have nodejs handy you could use this program.

The size of this library is also kept small by not using `aws-sdk` and this library is
about .5MB in size.

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
