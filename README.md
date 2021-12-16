# cf-invalidate

Send invalidations to cloudfront distributions that are part of a cloudformation stack

## Usage

```shell
$ npx cf-invalidate --help

Usage: cf-invalidate [options] <cloudformationStackName> <cloudformationOutputExportName> [cloudfrontInvalidationPath]

Arguments:
  cloudformationStackName         Cloudformation Stack Name
  cloudformationOutputExportName  Cloudformation Stack Cloudfront Distribution Id Export Name
  cloudfrontInvalidationPath      Cloudformation Stack Cloudfront Distribution Id Export Name (default: "/*")

Options:
  -r, --region                    AWS region
  -h, --help                      display help for command
```
