<template>
  <div class="team-card card card-content" @click="teamStore.addLap(team.id)">
    <!-- Team number -->
    <div class="team-card-number">
      {{ team.number }}
    </div>

    <!-- Team name -->
    <div class="team-card-name">
      {{ team.name }}
    </div>

    <!-- Team details -->
    <div class="team-card-details">
      <!-- Laps -->
      <div><b>Laps:</b> {{ team.lapsCount }}</div>

      <!-- Last seen -->
      <div><b>Last seen:</b> {{ timeSinceLastLap }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from "vue";
import { intervalToDuration } from "date-fns";
import { Team } from "../../types/models/team.model";
import { useTimeStore } from "../../stores/time.store";
import { useTeamsStore } from "../../stores/teams.store";

const props = defineProps({
  // Team to display
  team: {
    type: Object as PropType<Team>,
    required: true,
  },
});

const timeStore = useTimeStore();
const teamStore = useTeamsStore();

// Get the time since the last lap.
const timeSinceLastLap = computed(() => {
  const interval = intervalToDuration({ start: timeStore.clientTime, end: props.team.lapsLastTimestamp });

  // Convert the interval into a human readable format (e.g. "1h 10m 15s")
  let intervalFormatted = "";
  intervalFormatted += interval.days && interval.days > 0 ? `${interval.days}d ` : "";
  intervalFormatted += interval.hours && interval.hours > 0 ? `${interval.hours}h ` : "";
  intervalFormatted += interval.minutes && interval.minutes > 0 ? `${interval.minutes}m ` : "";
  intervalFormatted += `${interval.seconds}s`;
  intervalFormatted = intervalFormatted.trim();

  return intervalFormatted;
});

// Color values of the team card.
const color = computed(() => ({
  background: "white",
  text: "inherit",
}));
</script>

<style lang="scss" scoped>
.team-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow-wrap: anywhere;
  background-color: v-bind("color.background");
  color: v-bind("color.text");

  &-number {
    font-size: 3rem;
    font-weight: 600;
  }

  &-name {
    font-size: 1.5rem;
    font-weight: 500;
  }

  &-details {
    margin-top: 1rem;
  }
}
</style>
