import GhostAdminAPI from "@tryghost/admin-api";
import formidable from "formidable-serverless";

// Your API config
const api = new GhostAdminAPI({
  url: process.env.GHOST_API_URL,
  version: "v4",
  key: process.env.GHOST_ADMIN_API_KEY,
});

// so we can parse the form: https://gist.github.com/agmm/da47a027f3d73870020a5102388dd820
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function postAPI(req, res) {
  if (req.method != "POST") {
    res.status(405).send("Method not allowed.");
    return;
  }
  // read form req: https://gist.github.com/agmm/da47a027f3d73870020a5102388dd820
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, _) => {
    if (err) {
      res
        .status(500)
        .send("Internal Server Error - error when parsing form request");
      return;
    }
    const { title, content, member } = fields;
    if (!title) {
      res.status(400).send("Bad Request - title must not be empty.");
      return;
    }
    // post it to Ghost Admin
    let html = `<p>${content}</p>`;
    api.posts
      .add(
        {
          title: title,
          html,
          tags: [`${member}`],
          status: "published",
        },
        { source: "html" } // Tell the API to use HTML as the content source, instead of mobiledoc
      )
      .then((res) => console.log(JSON.stringify(res)))
      .catch((err) => console.log(err));
  });

  // redirect
  // await new Promise((r) => setTimeout(r, 2000));
  res.redirect(303, "http://localhost:2368");
}
