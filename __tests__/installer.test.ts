import * as fs from "fs";
import * as os from "os";
import * as path from "path";
process.env["RUNNER_TEMP"] = fs.mkdtempSync(path.join(os.tmpdir(), "ga-temp"));
process.env["RUNNER_TOOL_CACHE"] = fs.mkdtempSync(
  path.join(os.tmpdir(), "ga-cache")
);

import * as tc from "@actions/tool-cache";
import * as installer from "../src/installer";

jest.setTimeout(100000); // 10s

describe("installer", () => {
  let version: string;

  describe("getLatestVersion", () => {
    it("should get the latest version", async () => {
      version = await installer.getLatestVersion();
      expect(version).not.toEqual("");
    });
  });

  describe("pullGaImage", () => {
    it("should pull the image", async () => {
      await installer.pullGaImage(version);
      expect(tc.find("ga-image", version)).not.toEqual("");
    });

    it("should pull the image with '0.1.0'", async () => {
      await installer.pullGaImage("0.1.0");
      expect(tc.find("ga-image", "0.1.0")).not.toEqual("");
    });
  });

  describe("downloadGaBin", () => {
    it("should download the bin file", async () => {
      const downloadPath = await installer.downloadGaBin(version);
      expect(fs.existsSync(downloadPath)).toEqual(true);
      const stats = fs.statSync(downloadPath);
      expect("0" + (stats.mode & parseInt("777", 8)).toString(8)).toEqual(
        "0755"
      );
    });

    it("should download the bin file with '0.1.0'", async () => {
      const downloadPath = await installer.downloadGaBin("0.1.0");
      expect(fs.existsSync(downloadPath)).toEqual(true);
    });

    it("should download the bin file with 'v0.1.0'", async () => {
      const downloadPath = await installer.downloadGaBin("v0.1.0");
      expect(fs.existsSync(downloadPath)).toEqual(true);
    });
  });

  describe("downloadGa", () => {
    it("should download the bin file from cache", async () => {
      const downloadPath = await installer.downloadGa(version);
      expect(fs.existsSync(downloadPath)).toEqual(true);
    });
  });
});
