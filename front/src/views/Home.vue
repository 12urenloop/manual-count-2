<template>
  <v-layout wrap justify-center>
    <Team v-for="team in teams" :key="team.name" :team="team"/>
  </v-layout>
</template>

<script>
import { mapState } from "vuex";

import Team from "../components/Team.vue";

export default {
  name: "Home",
  components: {
    Team
  },
  computed: mapState({
    teams(state) {
      return Object.values(state.teams);
    }
  })
};
</script>

