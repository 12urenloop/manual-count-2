<template>
    <v-flex xs12 md6 lg3>
        <v-card class="team" v-on:click="queueLap" ripple :color="onDelay() ? 'grey' : ''">
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
                    <div :class="delay_warning_red ? 'team__warning__red' : ''" :color="delay_warning_red ">{{ delay_warning_message }}</div>
                    <div class="team__wait">{{ delay_message }}</div>
                </div>
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
            delay_warning_message: "",
            delay_warning_red: false
        }),

        created() {
            // Set the delay message.
            this.setDelayMessage();

            // Set the warning message.
            this.setWarningMessage();

            // Create an interval that will update the delay message every half second.
            setInterval(() => {

                // Set the delay message.
                this.setDelayMessage();

                    // Set the warning message.
                    this.setWarningMessage();
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
                    
                    // Set the INTERNAL last seen.
                    this.team.status.lastBumpAt = this.$store.state.timeManager.getTimestamp();

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
            },

            setWarningMessage() {

                // Calculate the delay in seconds.
                let seconds = Math.ceil((this.$store.state.timeManager.getTimestamp() - this.team.status.lastBumpAt) / 1000);
                
                // Timestring to display.
                let time = seconds - 60 >= 0 ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : `${seconds}s`; 

                // Set the delay warning message.
                this.delay_warning_message = `Last seen: ${time}`;

                // If the seconds is bigger than a given value, set the text-color on red.
                if(seconds >= Config.teams.delay_warning) {
                    this.delay_warning_red = true;
                } else {
                    this.delay_warning_red = false;
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

    .team__wait {
        color: #FF0000;
    }

    .team__counter {
        font-weight: bold;
        font-size: 40px;
    }

    .team__information {
        margin-bottom: 10px;
    }

    .team__warning__red {
        color: red;
    }
</style>


