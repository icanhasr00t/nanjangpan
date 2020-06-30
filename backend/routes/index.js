"use strict";

const express = require("express");
const router = express.Router();
const db = require("../db");
const fs = require("fs");
const utils = require("../utils");
const path = "/nanjangpan";
const { check } = require("express-validator");

// create
router.post(
  path,
  [
    check("title", "invalid title").custom((v) => utils.check4EmptyStrings(v)),
    check("passwd", "invalid passwd").isLength({ min: 4 }),
    check("body", "invalid body").isLength({ min: 2 }),
  ],
  async (req, res, next) => {
    // 1. validate
    try {
      utils.validate(req, res, false);
    } catch (e) {
      return res.status(e.status).send(e.errors);
    }

    try {
      // 2. format
      const { title, passwd, body } = req.body;

      // 3. massage
	  const subject = utils.sanitize(title);
      const content = utils.sanitize(body);

      // 4. insert
      const text =
        "INSERT INTO nanjangpan (passwd, at, title, body) VALUES (sha256($1), NOW(), $2, $3) RETURNING id";
      const values = [passwd, subject, content];

      const result = await db.query(text, values);
      return res.send(result.rows[0]);
    } catch (e) {
      return next(e);
    }
  }
);

// file upload: TODO: final test
router.post(`${path}/upload`, async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const file = req.files.file;

  if (!utils.isSafeFile(file)) {
    return res.status(400).send("Not allowed type");
  }

  const endpoint = "https://wtf.codentalks.com/imgs";
  const fName = utils.getFileName(file);
  if (fs.existsSync(`./uploads/${fName}`)) {
    return res.send(`${endpoint}/${fName}`);
  }

  file.mv(`./uploads/${fName}`, (err) => {
    if (err) return res.status(500).send(err);
    res.send(`${endpoint}/${fName}`);
  });
});

// list
router.get(path, async (req, res, next) => {

  const start = req.headers['start-at'] ? req.headers['start-at'] : 999999;
  const text = `SELECT n.id, n.at, title, count(nid) as replies 
  FROM nanjangpan n LEFT JOIN reply on n.id = reply.nid 
  WHERE n.id < $1
  GROUP BY n.id, n.at, title ORDER BY at DESC LIMIT 20`;

  try {
    
    const result = await db.query(text, [start]);
    return res.send(result.rows);

  } catch (e) {
    return next(e);
  }
});

// read a nakseo
router.get(
  `${path}/:id`,
  [check("id", "invalid id").isInt()],
  async (req, res, next) => {
    try {
      utils.validate(req, res);
    } catch (e) {
      return res.status(e.status).send(e.errors);
    }

    const reply_start_at = req.headers['start-at'];
    const id = req.params.id;

    // reply only
    if (reply_start_at) {
      try {
        const data = await getMoreReplies(id, reply_start_at);
        return res.send(data);
      } catch (e) {
        return next(e);
      }
    }

    try {
      const text = `SELECT n.id, n.at, title, n.body, r.body as rbody, r.at as rat, r.id as rid 
    FROM nanjangpan n LEFT JOIN reply r ON n.id = r.nid 
    WHERE n.id = $1 ORDER BY rat DESC 
    LIMIT 10`;
      const result = await db.query(text, [id]);
      if (result.rows.length <= 0) {
        return res.status(404).end();
      }

      const data = {
        id: result.rows[0].id,
        at: result.rows[0].at,
        title: result.rows[0].title,
        body: result.rows[0].body,
        replies: [],
      };

      if (result.rows[0].rid) {
		data.replies[0] = { 
            id: result.rows[0].rid, 
            body: result.rows[0].rbody,
          };
      }

      for (let i = 1; i < result.rows.length; i++) {
        data.replies.push({ id: result.rows[i].rid, body: result.rows[i].rbody });
      }

      return res.send(data);
    } catch (e) {
      return next(e);
    }
  }
);

const getMoreReplies = async (nid, start) => {
  const text = "SELECT id, body FROM reply WHERE nid = $1 AND id < $2 ORDER BY at DESC LIMIT 20";
  const result = await db.query(text, [nid, start]);
  return result.rows
};

// update a nakseo
router.put(
  `${path}/:id`,
    [ 
    check("title", "invalid title").custom((v) => utils.check4EmptyStrings(v)),
    check("passwd", "invalid passwd").isLength({ min: 4 }),
    check("body", "invalid body").isLength({ min: 2 }),
	],
  async (req, res, next) => {
    try {
      utils.validate(req, res);
    } catch (e) {
      return res.status(e.status).send(e.errors);
    }

    try {
      const { title, passwd, body } = req.body;
      const content = utils.sanitize(body);
      const id = req.params.id;
      const text =
        "UPDATE nanjangpan SET title=$1, body=$2, at=NOW() WHERE id=$3 and passwd=sha256($4) RETURNING id";
      const result = await db.query(text, [title, content, id, passwd]);
      if (result.rowCount === 0) {
        return res
          .status(422)
          .send({ error: "no update occurred, check the password" });
      }

      return res.send(result.rows);
    } catch (e) {
      return next(e);
    }
  }
);

// write a reply
router.post(
  `${path}/:id`,
   [check("body", "invalid reply").custom((v) => utils.check4EmptyStrings(v))],
  async (req, res, next) => {
    try {
      utils.validate(req, res);
    } catch (e) {
      return res.status(e.status).send(e.errors);
    }

    const nid = req.params.id;
    const { body } = req.body;

	const data = utils.sanitize(body);
    const replyText = data.length > 256 ? data.substring(0, 252) + "..." : data;

    try {
      const result = await db.query(
        "INSERT INTO reply (nid, body, at) VALUES ($1, $2, NOW()) RETURNING id",
        [nid, replyText]
      );
      return res.send(result.rows[0]);
    } catch (e) {
      return next(e);
    }
  }
);

// delete
router.delete(
  `${path}/:id`,
  [check("passwd", "invalid passwd").isLength({ min: 4 })],
  async (req, res, next) => {
    try {
      utils.validate(req, res);
    } catch (e) {
      return res.status(e.status).send(e.errors);
    }

    try {
      let q =
        "DELETE FROM nanjangpan WHERE id=$1 and passwd=sha256($2) RETURNING id";
      const params = [req.params.id, req.body.passwd];

      if (req.body.passwd === process.env.DAKEY) {
        q = "DELETE FROM nanjangpan WHERE id=$1 RETURNING id";
        params.splice(1);
      }
      const text = q;

      const result = await db.query(text, params);
      if (result.rowCount === 0) {
        return res
          .status(422)
          .send({ error: "no deletion occurred, check the password" });
      }
      return res.send(result.rows);
    } catch (e) {
      return next(e);
    }
  }
);

module.exports = router;
