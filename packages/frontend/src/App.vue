<template>
  <!-- Content -->
  <div class="container container--main">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { useTeamsStore } from "./stores/teams.store";
import { useTimeStore } from "./stores/time.store";

useTimeStore();
useTeamsStore();
</script>
