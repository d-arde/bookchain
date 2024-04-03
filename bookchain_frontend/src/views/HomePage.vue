<template>
  <div>
    <div>
      <div class="aboutSectionWrapper">
        <div>
          <h2 class="aboutSection font_bolder">
            Save money buying books on Bookchain!
          </h2>
          <p class="aboutSectionP font">
            Powered by Solana, Bookchain allows you to buy your textbooks
            online, using cryptocurrency. To help you get the fairest price
            possible.
          </p>
          <div>
            <br />
            <!-- <button class="searchBar font">Find your textbook here</button> -->
            <router-link :to="{ path: '/all_books' }" class="searchBar font"
              >Find your textbook here!</router-link
            >
          </div>
        </div>
        <div class="aboutImage">
          <img :src="require('@/img/bookchain cover.png')" alt="Laptop Image" />
        </div>
      </div>
      <br />
      <hr />
      <div class="whySectionWrapper">
        <div>
          <h3 class="whySectionHeader">Why Bookchain</h3>
          <p class="whySection">
            Bookchain implements cryptocurrency as a method to help students
            from all across to buy eTextbooks for the same price globally, this
            is implemented using blockchain technology for secure and safe
            transactions.
          </p>
        </div>
        <div class="whyImage">
          <img :src="require('@/img/solana cover.png')" alt="Solana Image" />
        </div>
      </div>
      <br />
      <hr />
      <div class="faqSectionWrapper">
        <h3 class="faqTitle font_bolder">
          Visit our FAQ page to find out how to stay safe on the blockchain
        </h3>
        <p class="faqSection font">
          Blockchains can be a tough place to traverse if you are not aware of
          the risk and dangers of the chain. Visit our FAQ page on the best tips
          on how to stay safe.
        </p>
      </div>
    </div>
    <br />
    <hr />
  </div>
</template>

<script setup></script>

<style>
@import "../css/frontPage.css";
</style>
