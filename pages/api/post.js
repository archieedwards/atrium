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
  try {
    const { title, content, memberID, member } = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, _) {
          if (err) {
              reject(err);
              return;
          }
          resolve(fields);
      });
    });
    if (!title || !memberID) {
      res.status(400).send("Bad Request - missing fields.");
      return;
    }
    // check member with uuid exists
    const members = await api.members.browse();
    const memberExists = members.filter(obj => {
      return obj.uuid === memberID
    });
    if(memberExists.length === 0){
      res.status(400).send("Bad Request - member invalid.");
      return;
    }
    // send post to Ghost Admin
    let html = `<p>${content}</p>`;
    const postResp = await api.posts
      .add(
        {
          title: title,
          html,
          tags: [`${member}`],
          status: "published",
        },
        { source: "html" } // Tell the API to use HTML as the content source, instead of mobiledoc
      );
    console.log(JSON.stringify(postResp))
    res.redirect(303, process.env.GHOST_API_URL);
  }catch(e){
    console.log(e)
    res.status(500).send("Internal Server Error");
    return;
  }
}