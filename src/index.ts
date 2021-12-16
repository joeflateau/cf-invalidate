#!/usr/bin/env node
import { CloudFormation, CloudFront } from "aws-sdk";
import { Command } from "commander";

export async function main() {
  const program = new Command()
    .argument("<cloudformationStackName>", "Cloudformation Stack Name")
    .argument(
      "<cloudformationOutputExportName>",
      "Cloudformation Stack Cloudfront Distribution Id Export Name"
    )
    .argument(
      "[cloudfrontInvalidationPath]",
      "Cloudformation Stack Cloudfront Distribution Id Export Name",
      "/*"
    )
    .action(
      async (
        cloudformationStackName: string,
        cloudformationOutputExportName: string,
        cloudfrontInvalidationPath: string
      ) => {
        const describeStacksResults = (
          await new CloudFormation()
            .describeStacks({
              StackName: cloudformationStackName,
            })
            .promise()
        ).Stacks;

        if (describeStacksResults == null) {
          throw new Error(`could not describe stacks`);
        }
        const distributionId = describeStacksResults[0].Outputs?.find(
          (output) => output.ExportName === cloudformationOutputExportName
        )?.OutputValue;

        if (distributionId == null) {
          throw new Error("could not find distribution output by export name");
        }

        const invalidationResult = await new CloudFront()
          .createInvalidation({
            DistributionId: distributionId,
            InvalidationBatch: {
              Paths: { Quantity: 1, Items: [cloudfrontInvalidationPath] },
              CallerReference: Date.now().toString(),
            },
          })
          .promise();

        const invalidationId = invalidationResult.Invalidation?.Id;

        if (invalidationId == null) {
          throw new Error("did not create invalidation");
        }

        console.log(
          `created invalidation '${invalidationId}' at path '${cloudfrontInvalidationPath}' on distribution '${distributionId}' from output exported as '${cloudformationOutputExportName}' from cloudformation stack '${cloudformationStackName}'`
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
