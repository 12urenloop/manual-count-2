<template>
    <v-flex xs12 md6 lg3>
        <v-card class="team" v-on:click="queueLap" ripple>
            <v-card-title primary-title>
                <div class="headline">
                    Team:
                    <b>{{ team.name }}</b>
                </div>
            </v-card-title>

            <v-card-text class="team__content">
                <div class="counter">{{ team.laps }}</div>
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
            delay_message: ""
        }),

        created() {

            // Set the delay message.
            this.setDelayMessage();

            // Create an interval that will update the delay message every half second.
            setInterval(() => {
                this.setDelayMessage();
            }, 500);
        },
        
        methods: {
            onDelay() {
                return this.team.timestamp >= new Date().getTime();
            },

            queueLap() {
                // Check if the wait time is already expired.
                // If not, don't queue a lap.
                if (!this.onDelay()) {
                    // Add 1 to the internal lap count.
                    this.team.laps += 1;

                    // Set the internal delay.
                    this.team.timestamp = new Date().getTime() + Config.teams.delay * 1000;

                    // Queue a lap
                    this.$store.teamManager.queueLap(this.team.id);
                }
            },

            setDelayMessage() {
                // Only display a message when the timestamp is not yet expired.
                if (this.onDelay()) {

                    // Calculate the delay in seconds.
                    let seconds = Math.ceil((this.team.timestamp - new Date().getTime()) / 1000);

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

    .counter {
        font-weight: bold;
        font-size: 40px;
    }
</style>


