<template>
  <div class="columns is-mobile is-multiline">
    <div class="column is-12-mobile is-4-tablet is-3-desktop" v-for="(team, index) in teamsStore.teams">
      <team-card :team="team" :key="index" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTeamsStore } from "../stores/teams.store";
import TeamCard from "@/src/components/teams/TeamCard.vue";

const teamsStore = useTeamsStore();
</script>
