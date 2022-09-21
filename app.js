const express = require("express");
const upload = require("express-fileupload");
const xlsx = require("xlsx");
const axios = require("axios");
const Excel = require("exceljs");
const path = require("path");

// express
const app = express();

// To upload files
app.use(upload());

// POST REQUEST TO UPLOAD FILES TO ./uploads FILE IN THE APPLICATION AND READ AND WRITE THE EXCEL FILE
app.post("/api/v1/uploadFile", (req, res) => {
  //Upload File
  const file = req.files.data;
  app.set("data", req.files.data.name);
  file.mv("./uploads/" + file.name, function (err, result) {
    if (err) {
      throw err;
    }

    // Read File
    const wb = xlsx.readFile(`./uploads/${file.name}`);
    const ws = wb.Sheets["Sheet1"];
    const data = xlsx.utils.sheet_to_json(ws);
    async function writeExcel() {
      const apiCall = data.map(async (record) => {
        // Making API Call asynchronious
        const URL = `https://api.storerestapi.com/products/${record.product_code}`;

        const response = await axios({
          method: "GET",
          url: URL,
        });

        // Getting the price field from API JSON
        return {
          price: response.data.data.price,
        };
      });

      // Storing the api result in the variable
      const results = await Promise.all(apiCall);

      // Writing the data into excel (price field)
      const workbook = new Excel.Workbook();
      workbook.xlsx.readFile(`./uploads/${file.name}`).then(function () {
        var worksheet = workbook.getWorksheet(1);
        for (i = 0; i < data.length; i++) {
          const cell = worksheet.getCell("B" + (2 + i));
          cell.value = results[i].price;
        }

        return workbook.xlsx.writeFile(`./uploads/${file.name}`);
      });
    }

    // Calling the function to write into the excel file
    writeExcel();

    // Send a simple response
    res.status(200).json({
      status: "success",
      message: "File Uploaded",
    });
  });
});

// GET Request for Downloading the file that we have modified (send response as FILE)
app.get("/api/v1/downloadFile", (req, res) => {
  // Download the file
  res.download(`./uploads/${app.get("data")}`);
});

module.exports = app;
