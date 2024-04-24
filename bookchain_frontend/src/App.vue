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
