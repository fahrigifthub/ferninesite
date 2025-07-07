// /api/tourl.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const FormData = require("form-data");
const { fileTypeFromBuffer } = require("file-type");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

router.post("/tourl", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    if (!buffer) return res.status(400).json({ status: false, message: "No file uploaded." });

    const cloudkuLink = await cloudkuUpload(buffer).catch(() => null);
    const catboxLink = await catboxUpload(buffer).catch(() => null);

    if (!cloudkuLink && !catboxLink) return res.status(500).json({ status: false, message: "Failed to upload to all services." });

    return res.json({
      status: true,
      size: buffer.length,
      result: {
        ...(cloudkuLink && { cloudku: cloudkuLink }),
        ...(catboxLink && { catbox: catboxLink })
      }
    });
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
});

async function cloudkuUpload(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: "bin", mime: "application/octet-stream" };
  const form = new FormData();
  form.append("file", buffer, { filename: `file.${ext}`, contentType: mime });

  const res = await fetch("https://cloudkuimages.guru/upload.php", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to upload to Cloudku Images.");
  const json = await res.json();
  if (json.status !== "success" || !json.result?.url) throw new Error("Invalid Cloudku response.");
  return json.result.url;
}

async function catboxUpload(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: "bin", mime: "application/octet-stream" };
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", buffer, {
    filename: `file.${ext}`,
    contentType: mime,
  });

  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Failed to upload to Catbox.");
  return await res.text();
}

module.exports = router;
