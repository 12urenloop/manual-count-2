<template>
  <v-layout wrap>
    <v-flex xs12>
      <v-card>
        <v-card-title primary-title>
          <div class="headline">Teams</div>
        </v-card-title>

        <v-card-text>
          <TeamList/>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import TeamList from "../components/TeamList.vue";

export default {
  name: "Teams",
  components: {
    TeamList
  }
};
</script>
