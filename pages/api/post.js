import GhostAdminAPI from "@tryghost/admin-api";
import formidable from "formidable-serverless";

// Your API config
const api = new GhostAdminAPI({
  url: "http://localhost:2368",
  version: "v4",
  key: "60dd846136a36346b3e17f48:48ecff2d793c49391fead9f8cdfcaf3deeb9c52294c01dda4862cf88add51ad5",
});

// so we can parse the form: https://gist.github.com/agmm/da47a027f3d73870020a5102388dd820
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function postAPI(req, res) {
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

  // receive reply
  res.status(200).json({ name: "John Doe" });
}
