<template>
  <div class="container is-max-desktop">
    <div class="card">
      <div class="card-content">
        <p>Are you really sure you want to {{ action }}</p>
      </div>
      <footer class="card-footer">
        <p class="card-footer-item" @click="returnToMainPage">Decline</p>
        <p class="card-footer-item is-success" @click="handleConfirm">Confirm</p>
      </footer>
    </div>
  </div>
</template>
<script lang="ts" setup>
  const props = defineProps({
    /**
     * What to trigger on confirm
     */
    trigger: {
      type: Function,
      required: true,
    },
    /**
     * How to describe the action
     */
    action: {
      type: String,
      required: true,
    },
  });

  const handleConfirm = () => {
    props.trigger();
    returnToMainPage();
  };

  const returnToMainPage = () => {
    window.location.href = window.location.origin;
  };
</script>
<style scoped lang="scss">
  .card-footer-item {
    cursor: pointer;
    &.is-success {
      font-weight: bold;
      color: green;
    }
  }
</style>
