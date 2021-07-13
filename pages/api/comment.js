import ghost from "../../lib/ghost";
import supabase from "../../lib/supabase";
import formidable from "formidable-serverless";

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
    const { postID, memberID, comment, slug } = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, _) {
          if (err) {
              reject(err);
              return;
          }
          resolve(fields);
      });
    });
    if (!postID || !memberID || !comment || !slug ) {
      res.status(400).send("Bad Request - missing fields.");
      return;
    }
    // check member with uuid exists
    const members = await ghost.members.browse();
    const memberExists = members.filter(obj => {
      return obj.uuid === memberID
    });
    if(memberExists.length === 0){
      res.status(400).send("Bad Request - member invalid.");
      return;
    }
    // check post with id exists
    const post = await ghost.posts.read({id: postID});
    if (!post){
      res.status(400).send("Bad Request - post invalid.");
      return;
    }
    // send comment to supabase
    const { supabaseResp, supabaseErr } = await supabase
      .from('Comments')
      .insert([
        { post_id: postID, member_id: memberID, comment: comment },
    ])
    if (supabaseErr) {
      console.log(supabaseErr)
      res.status(500).send("Internal Server Error");
      return;
    }
    console.log(JSON.stringify(supabaseResp))
    res.redirect(303, process.env.GHOST_API_URL+"/"+slug);
  }catch(e){
    console.log(e)
    res.status(500).send("Internal Server Error");
    return;
  }
}