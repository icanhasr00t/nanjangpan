"use strict";

const { validationResult } = require("express-validator");
const striptags = require("striptags");
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

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

const sanitize = (data) => {
  
  if (!data) {
    throw new Error("invalid data");
  }

  // stupid summernote
  if (data === "<p><br></p>") {
    throw new Error("invalid data");
  }

  // const noevent = removeEvents(data);
  const nospecials = data.replace(/[\u2000-\u3000\u3164\u00A0\uFEFF]/g, '').trim();
  const content = striptags(nospecials, [
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

  const DOMPurify = createDOMPurify(new JSDOM('').window);
  const clean = DOMPurify.sanitize(content);

  return clean;
};

const check4EmptyStrings = (string) => {
	const actual = string.replace(/[\u2000-\u3000\u3164\u00A0\uFEFF]/g, '').trim();
	if (!actual || actual.length < 2) {
		throw new Error('Invalid data');
	}
	return true;
};

const charToUnicode = (str) => {
  if (!str) return false; // Escaping if not exist
  var unicode = '';
  for (var i = 0, l = str.length; i < l; i++) {
    unicode += '\\' + str[i].charCodeAt(0).toString(16);
  };
  return unicode;
};

module.exports = {
  getFileName,
  isSafeFile,
  hasUnexpectedIframe,
  validate,
  sanitize,
  charToUnicode,
  check4EmptyStrings,
};
