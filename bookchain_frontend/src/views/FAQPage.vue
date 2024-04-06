<template>
  <div class="container font">
    <h1>FAQ</h1>

    <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
      <div class="question" @click="toggleAnswer(index)">
        {{ faq.question }}
        <span>&#9660;</span>
      </div>
      <div class="answer" :class="{ show: faq.show }">{{ faq.answer }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      faqs: [
        {
          question: "What is Bookchain?",
          answer:
            "Bookchain is an online bookstore built on Solana blockchain. It allows students from all around the world to buy textbooks digitally at the same price.",
          show: false,
        },
        {
          question: "How does Bookchain work?",
          answer:
            "Bookchain utilizes blockchain technology to securely store and distribute digital textbooks as tokens. Users can purchase these tokens using Solana cryptocurrency and access their textbooks through the Bookchain platform.",
          show: false,
        },
        {
          question: "Is Bookchain available worldwide?",
          answer:
            "Yes, Bookchain is accessible to students worldwide. As long as you have an internet connection, you can browse, purchase, and download textbooks from Bookchain.",
          show: false,
        },
        {
          question: "How do I pay for textbooks on Bookchain?",
          answer:
            "Bookchain accepts payments in Solana cryptocurrency. You can purchase Solana from various cryptocurrency exchanges and use them to buy textbooks on the platform.",
          show: false,
        },
        {
          question: "Can I sell my textbooks on Bookchain?",
          answer:
            "Currently, Bookchain is only focused on providing textbooks to students.",
          show: false,
        },
        {
          question: "What wallet do you recommend to use?",
          answer:
            "Phantom is the one we recommend, as they have been around since the existence of Solana and are trusted.",
          show: false,
        },
      ],
    };
  },
  methods: {
    toggleAnswer(index) {
      this.faqs[index].show = !this.faqs[index].show;
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.faq-item {
  margin-bottom: 20px;
}

.question {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.answer {
  font-size: 16px;
  margin-top: 10px;
  display: none;
}

.answer.show {
  display: block;
}

@import url("https://fonts.googleapis.com/css?family=Source+Sans+3");
.font {
  font-family: "Source Sans 3", sans-serif;
}

.font_bolder {
  font-family: "Source Sans 3", sans-serif;
  font-weight: bolder;
}
</style>
