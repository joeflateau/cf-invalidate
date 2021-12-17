#!/usr/bin/env node
import { CloudFormation, CloudFront } from "aws-sdk";
import { ServiceConfigurationOptions } from "aws-sdk/lib/service";
import { Command } from "commander";

export async function main() {
  const { region, stackName, outputExportName, invalidationPaths } =
    await parseArgs(process.argv);

  const { invalidationId, distributionId } = await createInvalidation(
    region,
    stackName,
    outputExportName,
    invalidationPaths
  );

  console.log(
    `created invalidation '${invalidationId}' at path(s) '${invalidationPaths}' on distribution '${distributionId}' from output exported as '${outputExportName}' from cloudformation stack '${stackName}'`
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export async function parseArgs(argv: string[]) {
  const command = new Command()
    .argument("<stackName>", "Cloudformation Stack Name")
    .argument(
      "<outputExportName>",
      "Name that the Cloudfront Distribution Id is exported from the stack as"
    )
    .argument(
      "[invalidationPath...]",
      "Paths on Cloudfront Distibution to invalidate",
      ["/*"]
    )
    .option("-r, --region <region>", "AWS region");

  await command.parseAsync(argv);

  const [stackName, outputExportName, invalidationPaths] =
    command.processedArgs as [string, string, string[]];
  const { region } = command.opts() as { region: string };

  return { stackName, outputExportName, invalidationPaths, region };
}

export async function createInvalidation(
  region: string | undefined,
  stackName: string,
  outputExportName: string,
  invalidationPath: string[]
) {
  const serviceConfig: ServiceConfigurationOptions = {
    region,
  };
  const cloudformation = new CloudFormation(serviceConfig);
  const cloudfront = new CloudFront(serviceConfig);

  const describeStackResponse = await cloudformation
    .describeStacks({
      StackName: stackName,
    })
    .promise();

  const stack = describeStackResponse.Stacks?.[0];

  if (stack == null) {
    throw new Error(`could not describe stack ${stackName}`);
  }

  const distributionId = stack.Outputs?.find(
    (output) => output.ExportName === outputExportName
  )?.OutputValue;

  if (distributionId == null) {
    throw new Error(
      `could not find distribution with export name ${outputExportName}`
    );
  }

  const invalidationResult = await cloudfront
    .createInvalidation({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: { Quantity: invalidationPath.length, Items: invalidationPath },
        CallerReference: Date.now().toString(),
      },
    })
    .promise();

  const invalidationId = invalidationResult.Invalidation?.Id;

  if (invalidationId == null) {
    throw new Error("did not create invalidation");
  }

  return { invalidationId, distributionId };
}
