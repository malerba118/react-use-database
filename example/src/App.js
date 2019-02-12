import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import useAsync from "./useAsync";
import { useDB, useNormalizedApi } from "./db";

function App() {
  const db = useDB();
  const normalizedApi = useNormalizedApi();
  let [getPostsRequest, getPosts] = useAsync(normalizedApi.getPosts);

  let posts = db.executeStoredQuery("ALL_POSTS");

  useEffect(() => {
    getPosts();
  }, []);

  useEffect(() => {
    console.log(db.entities)
  }, [db.entities])

  return (
    <div className="App">
      <h1>Posts</h1>
      {getPostsRequest.pending && <div>loading...</div>}
      {posts.map(p => (
        <div key={p.id}>
          <span>{p.title}</span>
          {!p.liked && (
            <button onClick={() => normalizedApi.likePost(p.id)}>like</button>
          )}
          {p.liked && (
            <button onClick={() => normalizedApi.unlikePost(p.id)}>
              unlike
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default App
