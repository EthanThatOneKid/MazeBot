const {run, get} = require('node-cmd');
console.log("Hello World");

get("cd tbg & node index.js", () => {
  console.log("Hello World");
  get("go north", (err, stdout, stderr) => console.log(stdout));
});
