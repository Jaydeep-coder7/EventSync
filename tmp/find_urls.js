const fs = require("fs");
const html = fs.readFileSync("/tmp/hero3.html", "utf-8");
const regex = /https:\/\/cdn\.21st\.dev\/[a-zA-Z0-9_\-\.\/]+\.tsx/g;
const matches = html.match(regex) || [];
console.log("Matches:", Array.from(new Set(matches)));
