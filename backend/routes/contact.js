const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const ContactSubmission = require("../models/ContactSubmission");
const auth = require("../middleware/auth");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

function generateMessageId() {
  return "<" + crypto.randomBytes(16).toString("hex") + ".carpetpetals@mail>";
}

// POST — public submit enquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message, attachments, selectedProducts, selectedCategories } = req.body;
    if (!name || !message) {
      return res.status(400).json({ success: false, message: "Name and message are required" });
    }

    const messageId = generateMessageId();

    const submission = await ContactSubmission.create({
      name, email, phone, message,
      attachments: attachments || [],
      selectedProducts: selectedProducts || [],
      selectedCategories: selectedCategories || [],
      emailMessageId: messageId,
    });

    try {
      const productList = (selectedProducts || []).map((p) => "• " + p.title).join("<br>");
      const categoryList = (selectedCategories || []).map((c) => "• " + c.name).join("<br>");
      const attachmentLinks = (attachments || []).map((a, i) => '<a href="' + a + '" style="color:#8B5E3C;">Attachment ' + (i + 1) + "</a>").join("<br>");

      await transporter.sendMail({
        from: '"Carpet Petals Website" <' + process.env.EMAIL_USER + ">",
        to: process.env.EMAIL_TO,
        subject: "New Enquiry from " + name + " — Carpet Petals",
        messageId: messageId,
        html:
          '<div style="font-family:Arial,sans-serif;max-width:600px;">' +
          '<h2 style="color:#8B5E3C;">New Enquiry — Carpet Petals</h2>' +
          '<table style="width:100%;border-collapse:collapse;">' +
          '<tr><td style="padding:8px;color:#6B6560;font-size:13px;width:130px;">Name</td><td style="padding:8px;font-weight:600;">' + name + "</td></tr>" +
          '<tr style="background:#F2EDE6;"><td style="padding:8px;color:#6B6560;font-size:13px;">Email</td><td style="padding:8px;">' + (email || "Not provided") + "</td></tr>" +
          '<tr><td style="padding:8px;color:#6B6560;font-size:13px;">Phone</td><td style="padding:8px;">' + (phone || "Not provided") + "</td></tr>" +
          '<tr style="background:#F2EDE6;"><td style="padding:8px;color:#6B6560;font-size:13px;">Message</td><td style="padding:8px;">' + message + "</td></tr>" +
          (productList ? '<tr><td style="padding:8px;color:#6B6560;font-size:13px;">Products</td><td style="padding:8px;">' + productList + "</td></tr>" : "") +
          (categoryList ? '<tr style="background:#F2EDE6;"><td style="padding:8px;color:#6B6560;font-size:13px;">Categories</td><td style="padding:8px;">' + categoryList + "</td></tr>" : "") +
          (attachmentLinks ? '<tr><td style="padding:8px;color:#6B6560;font-size:13px;">Attachments</td><td style="padding:8px;">' + attachmentLinks + "</td></tr>" : "") +
          "</table>" +
          '<p style="color:#A89F98;font-size:12px;margin-top:24px;">Saved in your admin dashboard at /admin/enquiries</p>' +
          "</div>",
      });
    } catch (emailErr) {
      console.error("Admin notification email failed:", emailErr.message);
    }

    res.status(201).json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET all — admin
router.get("/", auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const submissions = await ContactSubmission.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle important
router.put("/:id/important", auth, async (req, res) => {
  try {
    const submission = await ContactSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Not found" });
    submission.important = !submission.important;
    await submission.save();
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Close
router.put("/:id/close", auth, async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id, { status: "closed", read: true }, { new: true }
    );
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Reopen
router.put("/:id/reopen", auth, async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id, { status: "open" }, { new: true }
    );
    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Reply — email threading via In-Reply-To + References
router.post("/:id/reply", auth, async (req, res) => {
  try {
    const { message, attachments } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "Reply message required" });

    const submission = await ContactSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Not found" });
    if (!submission.email) return res.status(400).json({ success: false, message: "No email on this enquiry" });

    const replyAttachments = attachments || [];
    const replyMessageId = generateMessageId();

    submission.replies.push({ message, attachments: replyAttachments, sentAt: new Date() });
    submission.read = true;
    await submission.save();

    const attachmentHtml = replyAttachments.length > 0
      ? '<div style="margin-top:16px;"><strong style="color:#1C1917;font-size:13px;">Attachments:</strong><br>' +
        replyAttachments.map((a, i) => '<a href="' + a + '" style="color:#8B5E3C;">Attachment ' + (i + 1) + "</a>").join("<br>") +
        "</div>"
      : "";

    const previousReplies = submission.replies.slice(0, -1);
    const threadHistoryHtml = previousReplies.length > 0
      ? '<p style="color:#A89F98;font-size:11px;margin:16px 0 8px;">Previous replies in this conversation:</p>' +
        previousReplies.map((r, i) =>
          '<div style="margin-bottom:8px;padding:10px;background:#F9F6F2;border-left:3px solid #E0D8CE;">' +
          '<p style="font-size:11px;color:#A89F98;margin:0 0 6px;">Reply ' + (i + 1) + " — " + new Date(r.sentAt).toLocaleString("en-IN") + "</p>" +
          '<p style="font-size:13px;color:#6B6560;margin:0;">' + r.message + "</p>" +
          "</div>"
        ).join("")
      : "";

    const mailOptions = {
      from: '"Carpet Petals" <' + process.env.EMAIL_USER + ">",
      to: submission.email,
      subject: "Re: Your Enquiry — Carpet Petals",
      messageId: replyMessageId,
      headers: {
        "In-Reply-To": submission.emailMessageId || "",
        "References": submission.emailMessageId || "",
      },
      html:
        '<div style="font-family:Arial,sans-serif;max-width:600px;">' +
        '<h2 style="color:#8B5E3C;">Reply from Carpet Petals</h2>' +
        '<p style="color:#1C1917;">Dear ' + submission.name + ",</p>" +
        '<p style="color:#6B6560;line-height:1.7;">' + message + "</p>" +
        attachmentHtml +
        '<hr style="border:none;border-top:1px solid #E0D8CE;margin:24px 0;" />' +
        threadHistoryHtml +
        '<div style="margin-top:12px;padding:10px;background:#F9F6F2;border-left:3px solid #E0D8CE;">' +
        '<p style="font-size:11px;color:#A89F98;margin:0 0 6px;">Your original message</p>' +
        '<p style="font-size:13px;color:#6B6560;margin:0;">' + submission.message + "</p>" +
        "</div>" +
        '<p style="color:#A89F98;font-size:11px;margin-top:24px;">Carpet Petals · Varanasi, UP 221106, India</p>' +
        "</div>",
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, data: submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete
router.delete("/:id", auth, async (req, res) => {
  try {
    await ContactSubmission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Enquiry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;