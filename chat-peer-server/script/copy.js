const path = require("path");
const fs = require("fs");
const child_process = require("child_process");

let paths = fs.readdirSync(path.resolve("./build"));
paths.forEach((p) => {
  child_process.spawn("cp", ["-rf", path.resolve(path.resolve("./build"), p), path.resolve("../chat/")]);
});

child_process.spawn("cp", ["-rf", path.resolve("./ca"), path.resolve("../chat/ca")]);

let pack = fs.readFileSync(path.resolve("./package.json")).toString();
pack = JSON.parse(pack);
pack.dependencies["chat-peer-models"] = "file://./chat-peer-models";

fs.writeFileSync(path.resolve("../chat/package.json"), JSON.stringify(pack));

// child_process.spawn("cp", ["-rf", path.resolve("./package.json"), path.resolve("../chat/package.json")]);
