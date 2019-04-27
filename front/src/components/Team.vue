<template>
  <v-flex xs12 md6 lg3>
    <v-card class="team" v-on:click="addLap" :ripple="canAlreadyBump()">
      <v-card-text class="team__content">
        <div class="team__counter">{{ team.id }}</div>
        <div class="team__information">
          <div>
            Laps:
            <b>{{ team.status.lapCount }}</b>
          </div>
          <div>
            Team:
            <b>{{ team.name }}</b>
          </div>
        </div>
        <div class="team__messages">
          <div :class="`team__lastSeenAt ${lastSeenClass}`">Last seen {{lastSeenAt}}s ago</div>
          <div class="team__wait">Wait for</div>
        </div>
      </v-card-text>
    </v-card>
  </v-flex>
</template>

<script>
import { config } from "../config";

import { teamManager } from "../team/TeamManager";
import { timeManager } from "../team/TimeManager";

export default {
  name: "Team",
  props: {
    team: Object
  },

  data: () => ({
    lastLocalBump: 0
  }),

  created() {
    this.lastLocalBump = this.team.status.lastBumpAt;
  },

  computed: {
    lastSeenAt() {
      const lastSeen = this.team.status.lastBumpAt;
      const now = timeManager.now();
      return Math.ceil((now - lastSeen) / 1000);
    },

    lastSeenWarning() {
      return this.lastSeenAt >= config.teams.delay_warning;
    },

    lastSeenError() {
      return this.lastSeenAt >= config.teams.delay_error;
    },

    lastSeenClass() {
      if (this.lastSeenError) {
        return "team__lastSeenError";
      }

      if (this.lastSeenWarning) {
        return "team__lastSeenWarning";
      }

      return "team__lastSeenOK";
    }
  },

  methods: {
    canAlreadyBump() {
      const bumpAbleAt = this.team.status.unixTimeStampWhenBumpable;
      const now = timeManager.now();
      return bumpAbleAt <= now;
    },

    addLap() {
      // Check if the wait time is already expired.
      // If not, don't queue a lap.
      console.log("Bump before");
      if (this.canAlreadyBump()) {
        // Queue a lap
        console.log("Bump");
        this.lastLocalBump = timeManager.now();
        teamManager.queueLap(this.team.id);
      }
    }
  }
};
</script>

<style scoped>
.team {
  height: 100%;
}

.team__content {
  text-align: center;
}

.team__messages {
  height: 30px;
}

.team__counter {
  font-weight: bold;
  font-size: 40px;
}

.team__information {
  margin-bottom: 10px;
}

.team__lastSeenAt {
  font-style: italic;
}

.team__lastSeenError {
  color: red;
}

.team__lastTeamWarning {
  color: orange;
}

.team__lastTeamOK {
  color: green;
}
</style>


