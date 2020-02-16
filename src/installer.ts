import * as tc from "@actions/tool-cache";
import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import * as path from "path";
import { Octokit } from "@octokit/rest";
const octokit = new Octokit({
  auth: process.env["GITHUB_TOKEN"]
});

const IS_WINDOWS = process.platform === "win32";
let tempDirectory: string = process.env["RUNNER_TEMP"] || "";
if (!tempDirectory) {
  let baseLocation: string;
  if (IS_WINDOWS) {
    baseLocation = process.env["USERPROFILE"] || "C:\\";
  } else {
    if (process.platform === "darwin") {
      baseLocation = "/Users";
    } else {
      baseLocation = "/home";
    }
  }
  tempDirectory = path.join(baseLocation, "actions", "temp");
}

const mktempDir = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(
      tempDirectory,
      "temp_" + Math.floor(Math.random() * 2000000000)
    );
    io.mkdirP(tempDir)
      .then(() => resolve(tempDir))
      .catch(reject);
  });
};

export const getLatestVersion = async (): Promise<string> => {
  const { data } = await octokit.repos.getLatestRelease({
    owner: "superbrothers",
    repo: "ga"
  });
  if (data.tag_name) {
    return data.tag_name;
  }
  return "";
};

export const pullGaImage = async (version: string): Promise<void> => {
  // Remove "^v" from the version if it exists.
  if (version.substring(0, 1) == "v") {
    version = version.substring(1);
  }

  let cachePath = tc.find("ga-image", version);
  if (cachePath) {
    cachePath = path.join(cachePath, "ga.tar");
    core.info(`Found cached image ${cachePath}`);

    core.info(`Loading cached image ${cachePath}`);
    await exec.exec("docker", ["load", "-i", cachePath]);
    core.debug(`Loaded ${cachePath}`);
    return;
  }

  core.debug("Could not find cached image");

  const repoTag = `docker.io/superbrothers/ga:${version}`;
  core.info(`Pulling ${repoTag}`);
  await exec.exec("docker", ["pull", repoTag]);
  core.debug(`Pulled ${repoTag}`);

  const tempDir = await mktempDir();
  const imagePath = path.join(tempDir, "ga.tar");
  core.info(`Saving ${repoTag} to ${imagePath}`);
  await exec.exec("docker", ["save", repoTag, "-o", imagePath]);
  cachePath = await tc.cacheFile(imagePath, "ga.tar", "ga-image", version);
  core.info(`Cached ${imagePath} to ${cachePath}`);
};

export const downloadGaBin = async (version: string): Promise<string> => {
  // Add "^v" to the version if does not exist.
  if (version.substring(0, 1) !== "v") {
    version = `v${version}`;
  }

  let cachePath = tc.find("ga-bin", version);
  if (cachePath) {
    core.info(`Found cached bin file ${cachePath}`);
    return cachePath;
  }

  core.debug("Could not find cached bin file");

  const downloadUrl = `https://github.com/superbrothers/ga/releases/download/${version}/ga.zip`;
  core.info(`Downloading ${downloadUrl}`);
  const downloadPath = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);

  const tempDir = await mktempDir();
  core.info(`Extracting ${downloadPath} to ${tempDir}`);
  const extractedDir = await tc.extractZip(downloadPath, tempDir);
  core.debug(`Extracted to ${extractedDir}`);

  cachePath = await tc.cacheDir(
    path.join(extractedDir, "bin"),
    "ga-bin",
    version
  );
  core.info(`Cached ${extractedDir} to ${cachePath}`);

  return cachePath;
};

export const downloadGa = async (version: string): Promise<string> => {
  await pullGaImage(version);
  return await downloadGaBin(version);
};
