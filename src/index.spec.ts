import { expect } from "chai";
import { describe, it } from "mocha";
import { parseArgs } from "./index";

describe("cli", function () {
  it("should parse args", async () => {
    const { stackName, invalidationPaths, outputExportName, region } =
      await parseArgs([
        "node",
        "script.js",
        "--region",
        "us-east-1",
        "MyStack",
        "myExport",
        "/foo",
        "/bar",
      ]);
    expect(stackName).to.eq("MyStack");
    expect(outputExportName).to.eq("myExport");
    expect(region).to.eq("us-east-1");
    expect(invalidationPaths).to.deep.eq(["/foo", "/bar"]);
  });
  it("should have default path", async () => {
    const { stackName, invalidationPaths, outputExportName, region } =
      await parseArgs(["node", "script.js", "MyStack", "myExport"]);
    expect(stackName).to.eq("MyStack");
    expect(outputExportName).to.eq("myExport");
    expect(region).to.eq(undefined);
    expect(invalidationPaths).to.deep.eq(["/*"]);
  });
});
