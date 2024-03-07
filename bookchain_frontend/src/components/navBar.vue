<template>
  <nav class="navbar">
    <div class="title">
      <img
        src="@/img/bookchain logo dark mode.png"
        alt="bookchain logo"
        class="logo"
      />
      <h3 class="font_bolder">Bookchain</h3>
    </div>
    <div class="navLinks font">
      <router-link to="/" class="navLink">Home</router-link>
      |
      <router-link to="/all_books" class="navLink">All Books</router-link>
      |
      <router-link to="/subjects" class="navLink">Subjects</router-link>
      |
      <router-link to="/faq" class="navLink">FAQ</router-link>
    </div>
    <div><WalletMultiButton dark></WalletMultiButton></div>
  </nav>
</template>

<script>
import WalletMultiButton from "./WalletMultiButton.vue";
export default {
  methods: {},
  components: { WalletMultiButton },
};
</script>

<style scoped>
@import "../css/navbar.css";
</style>
