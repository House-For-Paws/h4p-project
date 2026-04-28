import { useEffect, useState } from "react";
import API from "../services/api";

function Home() {
  const [posts, setPosts] = useState([]);

  // נטען פוסטים כשהדף נפתח
  useEffect(() => {
    const fetchPosts = async () => {
      const res = await API.get("/posts");
      setPosts(res.data);
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Posts</h2>

      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.description}</p>
          <small>By: {post.username}</small>
        </div>
      ))}
    </div>
  );
}

export default Home;
