<template>
  <v-flex xs3 md3 lg3>
    <v-card
      :class="`team ${waitForAmount ? 'team__disabled' : ''}`"
      v-on:click="addLap"
      :ripple="canAlreadyBump()"
    >
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
          <div class="team__wait">{{waitForAmount ? `Wait for ${waitForAmount}` : ''}}</div>
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
    lastLocalBump: 0,
    now: timeManager.now()
  }),

  created() {
    this.lastLocalBump = this.team.status.lastBumpAt;
    var self = this;
    setInterval(function() {
      self.now = timeManager.now();
    }, 1000);
  },

  computed: {
    lastSeenAt() {
      const lastSeen = this.team.status.lastBumpAt;
      return Math.ceil((this.now - lastSeen) / 1000);
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
    },

    localBumpableAt() {
      return this.lastLocalBump + config.teams.delay_bumpable * 1000;
    },

    waitForAmount() {
      const bumpAbleAt = Math.max(
        this.localBumpableAt,
        this.team.status.unixTimeStampWhenBumpable
      );
      const waitAmount = Math.max(0, bumpAbleAt - this.now) / 1000;
      return Math.ceil(waitAmount);
    }
  },

  methods: {
    canAlreadyBump() {
      const bumpAbleAt = this.team.status.unixTimeStampWhenBumpable;
      return bumpAbleAt <= this.now && this.localBumpableAt <= this.now;
    },

    addLap() {
      // Check if the wait time is already expired.
      // If not, don't queue a lap.
      if (this.canAlreadyBump()) {
        // Queue a lap
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

.team__disabled {
  background-color: grey !important;
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


