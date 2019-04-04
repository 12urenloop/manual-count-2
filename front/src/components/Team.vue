<template>
    <v-flex xs12 md6 lg3>
        <v-card class="team" v-on:click="queueLap" ripple :color="delay_warning ? 'red' : ''">
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
                <div class="team__wait">{{ delay_message }}</div>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    import Config from "../config";

    export default {
        name: "Team",
        props: {
            team: Object
        },

        data: () => ({
            delay_message: "",
            delay_warning: false
        }),

        created() {
            // Set the delay message.
            this.setDelayMessage();

            // Create an interval that will update the delay message every half second.
            setInterval(() => {

                // Set the delay message.
                this.setDelayMessage();

                // Make the card red when it hasn't been bumped for some time.
                if(this.$store.state.timeManager.getTimestamp() > this.team.status.unixTimeStampWhenBumpable + Config.teams.delay_warning * 1000) {
                    this.delay_warning = true;
                } else {
                    this.delay_warning = false;
                }
            }, 500);
        },

        methods: {
            onDelay() {
                return this.team.status.unixTimeStampWhenBumpable >= this.$store.state.timeManager.getTimestamp();
            },

            queueLap() {
                // Check if the wait time is already expired.
                // If not, don't queue a lap.
                if (!this.onDelay()) {
                    // Add 1 to the INTERNAL lap count.
                    this.team.status.lapCount += 1;

                    // Set the INTERNAL delay.
                    this.team.status.unixTimeStampWhenBumpable = this.$store.state.timeManager.getTimestamp() + Config.teams.delay_bumpable * 1000;

                    // Queue a lap
                    this.$store.state.teamManager.queueLap(this.team.id);
                }
            },

            setDelayMessage() {
                // Only display a message when the timestamp is not yet expired.
                if (this.onDelay()) {
                    // Calculate the delay in seconds.
                    let seconds = Math.ceil((this.team.status.unixTimeStampWhenBumpable - this.$store.state.timeManager.getTimestamp()) / 1000);

                    this.delay_message = `Gelieve ${seconds}s te wachten.`;
                } else {
                    this.delay_message = "";
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

    .team__wait {
        color: red;
    }

    .team__counter {
        font-weight: bold;
        font-size: 40px;
    }

    .team__information {
        margin-bottom: 10px;
    }
</style>


