<template>
  <div id="app">
    <v-app>
      <v-container grid-list-md>
        <router-view/>
      </v-container>
      <Footer/>
    </v-app>
  </div>
</template>

<script>
import Footer from "./components/Footer.vue";

// DONT FUCKING REMOVE VUE WEBPACK IMPORT MAGIC
import { teamManager } from "./team/TeamManager";
import { timeManager } from "./team/TimeManager";

import "vuetify/dist/vuetify.min.css";

export default {
  name: "App",
  components: {
    Footer
  }
};
</script>

<style>
html,
body {
  margin: 0 auto;
  padding: 0;
  height: 100%;
  width: 100%;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: rgb(172, 172, 172);
}

.container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}
</style>
