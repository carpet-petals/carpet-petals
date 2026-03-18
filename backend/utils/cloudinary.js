const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicId(url) {
  if (!url || !url.includes("cloudinary.com")) return null;

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let path = url.slice(uploadIndex + "/upload/".length);

    const segments = path.split("/");
    const cleaned = [];
    let foundContent = false;

    for (const seg of segments) {
      if (!foundContent) {
        const isVersion = /^v\d+$/.test(seg);
        const isTransformation = /^[a-z]{1,3}_[^/]+$/.test(seg) || seg.includes(",");

        if (isVersion) {
          foundContent = true;
          continue;
        }
        if (isTransformation) {
          continue;
        }
        foundContent = true;
      }
      cleaned.push(seg);
    }

    const fullPath = cleaned.join("/");
    const publicId = fullPath.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
}

async function deleteFromCloudinary(url) {
  if (!url) return;

  const publicId = getPublicId(url);

  if (!publicId) {
    console.warn(`⚠️  Cloudinary: could not extract public_id from URL: ${url}`);
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log(`✅ Cloudinary deleted: ${publicId}`);
    } else if (result.result === "not found") {
      console.warn(`⚠️  Cloudinary: not found (already deleted?): ${publicId}`);
    } else {
      console.warn(`⚠️  Cloudinary unexpected result for ${publicId}:`, result);
    }
  } catch (err) {
    console.error(`❌ Cloudinary delete failed [${publicId}]:`, err.message);
  }
}

async function deleteManyFromCloudinary(urls = []) {
  const valid = urls.filter(Boolean);
  if (valid.length === 0) return;
  await Promise.all(valid.map(deleteFromCloudinary));
}

module.exports = { cloudinary, getPublicId, deleteFromCloudinary, deleteManyFromCloudinary };