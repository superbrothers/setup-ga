import * as core from "@actions/core";
import * as installer from "./installer";

export const main = async (): Promise<void> => {
  let version = core.getInput("ga-version");
  if (version == "") {
    version = await installer.getLatestVersion();
  }

  core.info(`Set up ga command, version ${version}`);
  const downloadPath = await installer.downloadGa(version);

  core.info(`Add ${downloadPath} to PATH`);
  core.addPath(downloadPath);
};

main().catch(err => {
  core.setFailed(err.message);
});
