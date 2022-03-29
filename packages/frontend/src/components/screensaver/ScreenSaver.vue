<template>
  <div v-if="shown" class="screensaver">
    <div class="screensaver__unlock" v-if="authenticated" @click="hideScreenSaver">
      <i class="fas fa-lock"></i>UNLOCK
    </div>
    <p class="screensaver__text" v-if="authenticated">Click the unlock button in the top right to start counting</p>
    <p class="screensaver__text" v-else>We are authenticating the client. If this is shown for a long period. Refresh
      the page</p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { authToServer } from "../../helpers/socket";
import { useWebsocketStore } from '../../stores/websocket.store'

const shown = ref(true);
const authenticated = ref(false);
let { getToken } = useWebsocketStore();

const hideScreenSaver = () => {
  shown.value = false;
};

onMounted(async () => {
  await authToServer();
  if (getToken() === '') {
    return;
  }
  authenticated.value = true;
  shown.value = import.meta.env.PROD;
});
</script>
<style lang="scss" scoped>
.screensaver {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 9999;
  user-select: none;

  &__unlock {
    align-self: end;
    margin-right: 1%;
    margin-top: 1%;
  }

  &__text {
    align-self: center;
    justify-self: center;
    margin-top: 25%;
    font-size: 1.5rem;
  }
}
</style>
