<template>
  <div
    :class="`team-card card card-content ${team.disabled ? 'disabled' : ''}`"
    :style="{
      backgroundColor: cardColor,
    }"
    @click="teamStore.addLap(team.id)"
    v-wave
  >
    <!-- Team number -->
    <div class="team-card-number">
      {{ team.id }}
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
      <div v-if="!isMobile()"><b>Last seen:</b> {{ timeSinceLastLap }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType, computed } from "vue";
  import { intervalToDuration } from "date-fns";
  import { Team } from "../../types/models/team.model";
  import { useTimeStore } from "../../stores/time.store";
  import { useTeamsStore } from "../../stores/teams.store";
  import { isMobile } from "../../helpers/util";
  import config from "../../config";

  const props = defineProps({
    // Team to display
    team: {
      type: Object as PropType<Team>,
      required: true,
    },
  });

  const TARGET_COLOR = "#ff7575";

  const timeStore = useTimeStore();
  const teamStore = useTeamsStore();

  const cardColor = computed(() => {
    const timeInterval = Math.round((timeStore.clientTime - props.team.lapsLastTimestamp) / 1000);
    if (timeInterval < config.teams.minIntervalSec) {
      return "inherit";
    }
    if (timeInterval > config.teams.minIntervalSec * 2) {
      return TARGET_COLOR;
    }
    let stepSize = timeInterval - config.teams.minIntervalSec;
    let redStep = (255 - parseInt(TARGET_COLOR.slice(1, 3), 16)) / config.teams.minIntervalSec;
    let blueStep = (255 - parseInt(TARGET_COLOR.slice(3, 5), 16)) / config.teams.minIntervalSec;
    let greenStep = (255 - parseInt(TARGET_COLOR.slice(5, 7), 16)) / config.teams.minIntervalSec;

    let redOutput = Math.round(255 - redStep * stepSize).toString(16);
    let blueOutput = Math.round(255 - blueStep * stepSize).toString(16);
    let greenOutput = Math.round(255 - greenStep * stepSize).toString(16);

    return `#${redOutput}${blueOutput}${greenOutput}`;
  });

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
</script>

<style lang="scss" scoped>
  .team-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    overflow-wrap: anywhere;
    background-color: white;
    color: inherit;
    cursor: pointer;
    font-size: 0.8rem;
    height: 100%;
    transition: background 0.3s ease-in-out;
    padding: v-bind('isMobile() ? ".75rem" : "1.5rem"');

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      background-color: #ababab !important;
    }

    &-number {
      font-size: v-bind("isMobile() ? '1.3rem' : '2rem'");
      font-weight: 600;
    }

    &-name {
      font-size: v-bind("isMobile() ? '.8rem' : '1.1rem'");
      font-weight: 500;
    }

    &-details {
      font-size: v-bind("isMobile() ? '.7rem' : 'inherit'");
      margin-top: v-bind("isMobile() ? '.25rem' : '0.5rem'");
    }
  }
</style>
