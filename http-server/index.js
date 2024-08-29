const http = require("http");
const fs = require("fs");
/*const getPort = () => {
  const index = process.argv.indexOf('--port');
  return index > -1 ? parseInt(process.argv[index + 1]) : 3000;
}*/
const args = require("minimist")(process.argv);
const port = args.port;

let homeContent = "";
let projectContent = "";
let registrationContent = "";

fs.readFile("home.html", (err, home) => {
  if (err) {
    throw err;
  }
  homeContent = home;
});

fs.readFile("project.html", (err, project) => {
  if (err) {
    throw err;
  }
  projectContent = project;
});
fs.readFile("registration.html", (err, registration) => {
  if (err) {
    throw err;
  }
  registrationContent = registration;
});


const server = http
  .createServer((request, response) => {
    let url = request.url;
    response.writeHeader(200, { "Content-Type": "text/html" });
    switch (url) {
      case "/project":
        response.write(projectContent);
        response.end();
        break;

      case "/registration":
        response.write(registrationContent);
        response.end();
        break;

      default:
        response.write(homeContent);
        response.end();
        break;
    }
  });

  server.listen(/*getPort()*/port);













/*const fs = require("fs");

fs.writeFile(
  "sample.txt",
  "Hello World. Welcome to Node.js File System module.",
  (err) => {                                                        //create a file
    if (err) throw err;
    console.log("File created!");
  }
);


fs.readFile("sample.txt", (err, data) => {
  if (err) throw err;                                               //read the created file
  console.log(data.toString());
});




fs.appendFile("sample.txt", " This is my updated content", (err) => {
  if (err) throw err;                                                     //Add content to created file
  console.log("File updated!");
});




fs.rename("sample.txt", "test.txt", (err) => {
  if (err) throw err;                                                //reneme file form sample to test
  console.log("File name updated!");
});



fs.unlink("test.txt", (err) => {
  if (err) throw err;                                             //delete test file
  console.log("File test.txt deleted successfully!");
});   */