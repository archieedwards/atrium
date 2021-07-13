import supabase from "../../../lib/supabase";

export default async function getAPI(req, res) {
  if (req.method != "GET") {
    res.status(405).send("Method not allowed.");
    return;
  }
  const { postID } = req.query
  try {
    const { data, error } = await supabase
      .from('comments')
      .select()
      .eq('post_id', postID)
      .order('created_at', { ascending: true });
    if (error) {
      console.log(error)
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send(data);
  }catch(e){
    console.log(e)
    res.status(500).send("Internal Server Error");
  }
}