<template>
  <div class="status">
    <div :class="`tag is-${wsStore.backendStatus ? 'success' : 'danger' }`">Backend</div>
    <div :class="`tag is-${wsStore.telraamStatus ? 'success' : 'danger' }`">Telraam</div>
  </div>
</template>
<script lang="ts" setup>
import { useWebsocketStore } from "../../stores/websocket.store";

const wsStore = useWebsocketStore();
</script>
<style lang="scss" scoped>
.status {
  position: absolute;
  top: .5em;
  right: 0;
  & > div {
    margin-left: 0.5rem;
  }
}
</style>