const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicId(url) {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    // Example URL: https://res.cloudinary.com/cloud/image/upload/v1234/carpet-petals/filename.jpg
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function deleteFromCloudinary(url) {
  const publicId = getPublicId(url);
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary delete [${publicId}]:`, result.result);
  } catch (err) {
    console.error(`Cloudinary delete failed [${publicId}]:`, err.message);
  }
}

async function deleteManyFromCloudinary(urls = []) {
  const valid = urls.filter(Boolean);
  if (valid.length === 0) return;
  await Promise.all(valid.map(deleteFromCloudinary));
}

module.exports = { cloudinary, deleteFromCloudinary, deleteManyFromCloudinary };