# cf-invalidate

Send invalidations to cloudfront distributions that are part of a cloudformation stack

## Usage

```shell
$ npx cf-invalidate --help

Usage: cf-invalidate [options] <stackName> <outputExportName> [invalidationPath]

Arguments:
  stackName              Cloudformation Stack Name
  outputExportName       Name that the Cloudfront Distribution Id is exported from the stack as
  invalidationPath       Path on Cloudfront Distibution to invalidate (default: "/*")

Options:
  -r, --region <region>  AWS region
  -h, --help             display help for command
```
