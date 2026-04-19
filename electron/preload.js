"use strict";
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("leadveroApp", {
  version: process.env.npm_package_version || "0.1.0",
});
