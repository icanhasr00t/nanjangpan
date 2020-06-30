"use strict";
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const helmet = require('helmet');
const fileUpload = require("express-fileupload");

const indexRouter = require("./routes/index");

const app = express();
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    // TODO: change to local
    tempFileDir: "/tmp/",
  })
);
app.use(logger("dev"));
app.use(express.json({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());

app.use("/", indexRouter);

module.exports = app;
