<template>
  <div class="columns is-mobile is-multiline">
    <ScreenSaver />
    <ServerStatus />
    <div class="column is-4-mobile is-3-tablet is-2-desktop" v-for="(team, index) in teamsStore.teams">
      <team-card :team="team" :key="index" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useTeamsStore } from "../stores/teams.store";
  import TeamCard from "@/src/components/teams/TeamCard.vue";
  import ScreenSaver from "@/src/components/screensaver/ScreenSaver.vue";
  import ServerStatus from "@/src/components/status/serverStatus.vue";

  const teamsStore = useTeamsStore();
</script>
