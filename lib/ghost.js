import GhostAdminAPI from "@tryghost/admin-api";

// Your API config
const ghost = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  version: "v4",
  key: process.env.GHOST_ADMIN_API_KEY,
});

export default ghost;
