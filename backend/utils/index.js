"use strict";

const { validationResult } = require("express-validator");
const striptags = require("striptags");

const isSafeFile = (file) => {
  if (file && file.mimetype) {
    return file.mimetype.startsWith("image/");
  }
  return false;
};

const getFileName = (file) => {
  if (file && file.name && file.md5) {
    let ext = "";
    const at = file.name.lastIndexOf(".");
    if (at >= 0) {
      ext = file.name.substr(at);
    }

    return `${file.md5}${ext}`;
  }

  return "";
};

const hasUnexpectedIframe = (body, from = 0) => {
  if (body) {
    const data = body.toLocaleLowerCase();
    const frame = data.indexOf("<iframe", from);

    if (frame === -1) {
      return false;
    }

    const start = data.indexOf("//", frame + 6);
    if (start === -1) {
      return false;
    }

    const end = data.indexOf('"', start + 2);
    if (end === -1) {
      return false;
    }

    if (start > end) {
      return false;
    }

    const hotspot = data.substring(start, end).indexOf("youtube.com");
    if (hotspot === -1) {
      return true;
    }

    return hasUnexpectedIframe(body, end);
  }
};

const validate = (req, checkId = true) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw { status: 400, errors: errors.array() };
  }

  if (checkId && req.params.id < 1) {
    throw { status: 400, errors: "invalid id" };
  }
};

const sanitizeBody = (body) => {
  if (!body) {
    throw new Error("invalid body");
  }

  // stupid summernote
  if (body === "<p><br></p>") {
    throw new Error("invalid body");
  }

  const noevent = body.replace(/onerror|onabort|onload|onbeforeunload|onunload/gi,"");
  const content = striptags(noevent, [
    "img",
    "iframe",
    "a",
    "pre",
    "code",
    "br",
    "p",
    "li",
    "ul",
    "blockquote",
    "b",
    "u",
    "span",
    "table",
    "th",
    "tr",
    "td",
    "tbody",
    "h1",
    "h2",
    "h3",
    "h4",
  ]);

  if (hasUnexpectedIframe(content)) {
    throw { status: 400, error: "Contains an unknown iframe source" };
  }

  if (!content || content.trim().length < 2) {
    throw new Error("invalid body");
  }

  return content;
};

module.exports = {
  getFileName,
  isSafeFile,
  hasUnexpectedIframe,
  validate,
  sanitizeBody,
};
