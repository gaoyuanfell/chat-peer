const path = require("path");
const child_process = require("child_process");
child_process.spawn("cp", ["-r", path.resolve("./www"), path.resolve("../chat")]);
