<template>
  <div class="create-post">
    <BlogCoverPreview v-show="this.$store.state.blogPhotoPreview" />
    <Loading v-show="loading" />
    <div class="container">
      <div :class="{ invisible: !error }" class="err-message">
        <p><span>Error:</span>{{ this.errorMsg }}</p>
      </div>
      <div class="blog-info">
        <input type="text" placeholder="Enter Blog Title" v-model="blogTitle" />
        <div class="upload-file">
          <label for="blog-photo">Upload Cover Photo</label>
          <input
            type="file"
            ref="blogPhoto"
            id="blog-photo"
            @change="fileChange"
            accept=".png, .jpg, ,jpeg"
          />
          <button
            @click="openPreview"
            class="preview"
            :class="{ 'button-inactive': !this.$store.state.blogPhotoFileURL }"
          >
            Preview Photo
          </button>
          <span>File Chosen: {{ this.$store.state.blogPhotoName }}</span>
        </div>
      </div>
      <div class="editor">
        <QuillEditor
          :modules="modules"
          theme="snow"
          toolbar="full"
          content-type="html"
          v-model:content="blogHTML"
        />
      </div>
      <div class="blog-actions">
        <button @click="updateBlog">Save Changes</button>
        <router-link
          class="router-button"
          :to="{ name: 'BlogPreview' }"
          target="_blank"
          >Preview Changes</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import BlogCoverPreview from "../components/BlogCoverPreview.vue";
import Loading from "../components/Loading.vue";
import { QuillEditor } from "@vueup/vue-quill";
import { storage } from "../firebase/initialApp";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import ImageUploader from "quill-image-uploader";
import BlotFormatter from "quill-blot-formatter/dist/BlotFormatter";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db } from "../firebase/initialApp";
import { doc, updateDoc } from "firebase/firestore";
export default {
  name: "EditBlog",
  components: {
    BlogCoverPreview,
    Loading,
    QuillEditor,
  },
  data() {
    return {
      profileId: auth?.currentUser?.uid,
      file: null,
      error: null,
      errorMsg: null,
      loading: null,
      routeID: "null",
      currentBlog: null,
      editorSettings: {
        modules: {
          imageResize: {},
        },
      },
    };
  },
  async mounted() {
    this.routeID = this.$route.params.blogid;
    this.currentBlog = await this.$store.state.blogPosts.filter((post) => {
      return post.blogID === this.routeID;
    });
    this.$store.commit("setBlogState", this.currentBlog[0]);
    localStorage.setItem("@blogTitle", this.$store.state.blogTitle);
    localStorage.setItem("@blogPhotoURL", this.$store.state.blogPhotoFileURL);
    localStorage.setItem("@blogHTML", this.$store.state.blogHTML);
  },
  methods: {
    async fileChange() {
      this.file = this.$refs.blogPhoto.files[0];
      const fileName = this.file.name;
      const storageRef = ref(
        storage,
        `documents/BlogCoverPhotos/${this.$store.state.blogPhotoName}`
      );
      await uploadBytes(storageRef, this.file);
      const downloadURL = await getDownloadURL(storageRef);
      this.$store.commit("fileNameChange", fileName);
      this.$store.commit("createFileURL", downloadURL);
      localStorage.setItem("@blogPhotoURL", downloadURL);
    },
    openPreview() {
      this.$store.commit("openPhotoPreview");
    },
    async updateBlog() {
      const blogRef = doc(db, "blogPosts", this.routeID);
      if (this.blogTitle.length !== 0 && this.blogHTML.length !== 0) {
        if (this.file) {
          this.loading = true;

          await updateDoc(blogRef, {
            blogHTML: this.blogHTML,
            blogCoverPhoto: this.blogPhotoURL,
            blogCoverPhotoName: this.blogCoverPhotoName,
            blogTitle: this.blogTitle,
          });

          await this.$store.dispatch("updatePost", this.routeID);
          this.loading = false;
          this.$router.push({
            name: "ViewBlog",
            params: { blogid: blogRef.id },
          });
          return;
        }
        this.loading = true;
        await updateDoc(blogRef, {
          blogHTML: this.blogHTML,
          blogTitle: this.blogTitle,
        });
        await this.$store.dispatch("updatePost", this.routeID);
        this.loading = false;
        this.$router.push({ name: "ViewBlog", params: { blogid: blogRef.id } });
        return;
      }
      this.error = true;
      this.errorMsg = "Please ensure Blog Title & Blog Post has been filled!";
      setTimeout(() => {
        this.error = false;
      }, 5000);
      return;
    },
  },
  computed: {
    blogCoverPhotoName() {
      return this.$store.state.blogPhotoName;
    },
    blogTitle: {
      get() {
        return this.$store.state.blogTitle;
      },
      set(payload) {
        this.$store.commit("updateBlogTitle", payload);
        localStorage.setItem("@blogTitle", payload);
      },
    },
    blogPhotoURL() {
      return this.$store.state.blogPhotoFileURL;
    },
    blogHTML: {
      get() {
        return this.$store.state.blogHTML;
      },
      set(payload) {
        this.$store.commit("newBlogPost", payload);
        localStorage.setItem("@blogHTML", payload);
      },
    },
  },
  setup: () => {
    const modules = [
      {
        name: "imageUploader",
        module: ImageUploader,
        options: {
          upload: (file) => {
            return new Promise(async (resolve, reject) => {
              try {
                const storageRef = ref(
                  storage,
                  `documents/blogPostPhotos/${file.name}`
                );
                await uploadBytes(storageRef, file);
                const imageUrl = await getDownloadURL(storageRef);

                resolve(imageUrl);
              } catch (err) {
                reject("Upload failed");
                console.error("Error:", err);
              }
            });
          },
        },
      },
      {
        name: "blotFormatter",
        module: BlotFormatter,
        options: {
          /* options */
        },
      },
    ];
    return { modules };
  },
};
</script>

<style lang="scss">
.create-post {
  position: relative;
  height: 100%;

  button {
    margin-top: 0;
  }

  .router-button {
    text-decoration: none;
    color: #fff;
  }

  label,
  button,
  .router-button {
    transition: 0.5s ease-in-out all;
    align-self: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 20px;
    padding: 12px 24px;
    color: #fff;
    background-color: #303030;
    text-decoration: none;

    &:hover {
      background-color: rgba(48, 48, 48, 0.7);
    }
  }

  .container {
    position: relative;
    height: 100%;
    padding: 10px 25px 60px;
  }

  // error styling
  .invisible {
    opacity: 0 !important;
  }

  .err-message {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    color: #fff;
    margin-bottom: 10px;
    background-color: #303030;
    opacity: 1;
    transition: 0.5s ease all;

    p {
      font-size: 14px;
    }

    span {
      font-weight: 600;
    }
  }

  .blog-info {
    display: flex;
    margin-bottom: 32px;

    input:nth-child(1) {
      min-width: 300px;
    }

    input {
      transition: 0.5s ease-in-out all;
      padding: 10px 4px;
      border: none;
      border-bottom: 1px solid #303030;

      &:focus {
        outline: none;
        box-shadow: 0 1px 0 0 #303030;
      }
    }

    .upload-file {
      flex: 1;
      margin-left: 16px;
      position: relative;
      display: flex;

      input {
        display: none;
      }

      .preview {
        margin-left: 16px;
        text-transform: initial;
      }

      span {
        font-size: 12px;
        margin-left: 16px;
        align-self: center;
      }
    }
  }

  .editor {
    height: 60vh;
    display: flex;
    flex-direction: column;

    .quillWrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .ql-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: scroll;
    }

    .ql-editor {
      padding: 20px 16px 30px;
    }
  }

  .blog-actions {
    margin-top: 32px;

    button {
      margin-right: 16px;
    }
  }
}
</style>
