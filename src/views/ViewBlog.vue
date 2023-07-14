<template>
  <div class="post-view" v-if="currentBlog">
    <div class="container quillWrapper">
      <h2>{{ this.currentBlog.blogTitle }}</h2>
      <h4>
        Posted on:
        {{
          new Date(this.currentBlog.blogDate?.seconds * 1000).toLocaleString(
            "id-ID",
            {
              dateStyle: "long",
            }
          )
        }}
      </h4>
      <img :src="this.currentBlog.blogCoverPhoto" alt="" />
      <div
        class="post-content ql-editor"
        v-html="this.currentBlog.blogHTML"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ViewBlog",
  computed: {
    currentBlog() {
      const blogData = this.$store.state.blogPosts.find((post) => {
        return post.blogID === this.$route.params.blogid;
      });
      document.title = blogData.blogTitle;
      return blogData;
    },
  },
};
</script>

<style lang="scss">
.post-view {
  h4 {
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 24px;
  }
}
</style>
