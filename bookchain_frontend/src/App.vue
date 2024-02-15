<!-- <template>
  <div class="App">
    <FrontPage />
  </div>
</template>

<script>
import FrontPage from "./components/frontPage";

export default {
  components: {
    FrontPage,
  },
};
</script>

<style>
/* if you want to change the bg colour, change in index.html too */
.App {
  background-color: #222222;
}
</style> -->
<script>
import Navbar from "./components/navBar.vue";
import { Buffer } from "buffer";
window.Buffer = Buffer;

export default {
  components: {
    Navbar,
  },
};
</script>

<template>
  <Navbar />
  <RouterView />
</template>
