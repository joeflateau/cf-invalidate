#!/usr/bin/env node
import { CloudFormation, CloudFront } from "aws-sdk";
import { Command } from "commander";

export async function main() {
  const program = new Command()
    .argument("<stackName>", "Cloudformation Stack Name")
    .argument(
      "<outputExportName>",
      "Name that the Cloudfront Distribution Id is exported from the stack as"
    )
    .argument(
      "[invalidationPath]",
      "Path on Cloudfront Distibution to invalidate",
      "/*"
    )
    .option("-r, --region <region>", "AWS region")
    .action(
      async (
        stackName: string,
        outputExportName: string,
        invalidationPath: string
      ) => {
        const { region }: { region?: string } = program.opts();

        const describeStacksResults = (
          await new CloudFormation({
            region,
          })
            .describeStacks({
              StackName: stackName,
            })
            .promise()
        ).Stacks;

        if (describeStacksResults == null) {
          throw new Error(`could not describe stacks`);
        }
        const distributionId = describeStacksResults[0].Outputs?.find(
          (output) => output.ExportName === outputExportName
        )?.OutputValue;

        if (distributionId == null) {
          throw new Error("could not find distribution output by export name");
        }

        const invalidationResult = await new CloudFront({ region })
          .createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
              Paths: { Quantity: 1, Items: [invalidationPath] },
              CallerReference: Date.now().toString(),
            },
          })
          .promise();

        const invalidationId = invalidationResult.Invalidation?.Id;

        if (invalidationId == null) {
          throw new Error("did not create invalidation");
        }

        console.log(
          `created invalidation '${invalidationId}' at path '${invalidationPath}' on distribution '${distributionId}' from output exported as '${outputExportName}' from cloudformation stack '${stackName}'`
        );
      }
    );
  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
