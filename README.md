# cf-invalidate

Send invalidations to cloudfront distributions that are part of a cloudformation stack

## Installation

I recommend you install this as a dev dependency in your project and run it with npx.

```shell
npm i -D cf-invalidate
npx cf-invalidate MyStack cloudfrontDistributionId
```

You can also install this globally on your system (but I don't recommend it)

```shell
npm i -g cf-invalidate
```

## Usage

```shell
$ npx cf-invalidate --help

Usage: cf-invalidate [options] <stackName> <outputExportName> [invalidationPath...]

Arguments:
  stackName              Cloudformation Stack Name
  outputExportName       Name that the Cloudfront Distribution Id is exported from the stack as
  invalidationPath       Paths on Cloudfront Distibution to invalidate (default: ["/*"])

Options:
  -r, --region <region>  AWS region
  -h, --help             display help for command
```

### Example with CDK

Add a `cdk.CfnOutput` that outputs `cloudfront.Distribution#distributionId`

```typescript
const dist = new cloudfront.Distribution(this, "CFDist", {
  defaultBehavior: {
    origin: new origins.LoadBalancerV2Origin(loadBalancer),
  },
});

new cdk.CfnOutput(this, "CFDistNameOutput", {
  value: dist.distributionId,
  exportName: "cloudfrontDistributionId",
});
```

Run cdk deploy then run cf-invalidate

```shell
npx cdk deploy MyStack
npx cf-invalidate MyStack cloudfrontDistributionId
```
