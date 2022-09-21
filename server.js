const app = require("./app");

// Port Number to run
const port = 3000;

// Start the server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
