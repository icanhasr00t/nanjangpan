"use strict";
const { Pool } = require("pg");
const pool = new Pool({
  user: "nanjang",
  host: "localhost",
  database: "nanjang",
  password: `${process.env.DBPASS}`,
  port: 5432,
});
module.exports = {
  query: (text, params) => pool.query(text, params),
};
