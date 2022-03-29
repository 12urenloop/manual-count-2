<template>
  <div class="status">
    <div class="field is-grouped is-grouped-multiline">
      <div class="control">
        <div class="tags has-addons">
          <div :class="`tag is-dark`">Time Offset</div>
          <div :class="`tag is-${timeStore.serverTimeOffset < 3000 ? 'success' : 'danger'}`">
            {{ timeStore.serverTimeOffset }}ms
          </div>
        </div>
      </div>

      <div class="control">
        <div class="tags has-addons">
          <div :class="`tag is-dark`">Backend</div>
          <div :class="`tag is-${wsStore.backend.online ? 'success' : 'danger'}`">
            {{ wsStore.backend.online ? "Online" : "Offline" }}
          </div>
          <div v-if="!wsStore.backend.online" class="tag is-dark">{{ wsStore.backend.offlineTime }}s</div>
        </div>
      </div>

      <div class="control">
        <div class="tags has-addons">
          <div :class="`tag is-dark`">Telraam</div>
          <div :class="`tag is-${wsStore.telraam.online ? 'success' : 'danger'}`">
            {{ wsStore.telraam.online ? "Online" : "Offline" }}
          </div>
          <div v-if="!wsStore.telraam.online" class="tag is-dark">{{ wsStore.telraam.offlineTime }}s</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { useWebsocketStore } from "../../stores/websocket.store";
  import { useTimeStore } from "@/src/stores/time.store";

  const wsStore = useWebsocketStore();
  const timeStore = useTimeStore();
</script>
<style lang="scss" scoped>
  .status {
    position: absolute;
    top: 0.5em;
    right: 0;
    & > div {
      margin-left: 0.5rem;
    }
  }
</style>
