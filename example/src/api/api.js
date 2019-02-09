import users from "./users.json";
import allPosts from "./posts.json";
let posts = allPosts.slice(0, 10);

function timeout(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const TIMEOUT_MS = 2000;

class MockApiClient {
  async getPosts() {
    await timeout(TIMEOUT_MS);
    return posts;
  }

  async likePost(id) {
    // await timeout(TIMEOUT_MS)
    let post = posts.find(p => p.id === id);
    if (post) {
      // Normally user would be inferred from auth token
      post.liked = true;
    }
    return post;
  }

  async unlikePost(id) {
    // await timeout(TIMEOUT_MS)
    let post = posts.find(p => p.id === id);
    if (post) {
      post.liked = false;
    }
    return post;
  }
}

// Export Singleton
const mockApiClient = new MockApiClient();

export default mockApiClient;
