<template>
  <!-- Content -->
  <div class="container container--main">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
  import { useTeamsStore } from "./stores/teams.store";
  import { useTimeStore } from "./stores/time.store";
  import { useWebsocketStore } from "@/src/stores/websocket.store";

  useTimeStore();
  useTeamsStore();
  useWebsocketStore();
</script>
