<template>
  <ConfirmationModal action="reset your current queue of laps in storage" :trigger="resetQueue" />
</template>
<script lang="ts" setup>
  import ConfirmationModal from "@/src/components/modals/ConfirmationModal.vue";

  const resetQueue = () => {
    window.localStorage.setItem("queuedLaps", "[]");
  };
</script>
