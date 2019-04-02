<template>
    <v-flex xs12 md6 lg3>
        <v-card>

            <v-card-title primary-title>
                <div>
                    <div class="headline">Team: <b>{{ name }}</b></div>
                </div>
            </v-card-title>

            <v-card-text class="team__content">
                <div class="counter">{{ count }}</div>
                <v-btn v-on:click="addCount" raised large color="primary">+1</v-btn>
                <p class="team__wait">{{ wait_message }}</p>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>

    import Config from "../config"

    export default {
        name: "Team",
        props: {
            name: String
        },
        data() {
            return {
                count: 0,
                wait_delay: 0,
                wait_message: ""
            }
        },
        methods: {
            addCount() {

                // Check if we have to wait before pressing the button again.
                // This is to prevent multiple clicks at the same time.
                if(this.wait_delay == 0) {
                    
                    // Add local count by one.
                    this.count += 1;

                    // Add the count to the queue.
                    this.$store.state.queue.push(this.name);

                    // Set the wait delay.
                    this.setDelay();
                }
            },

            setDelay() {
                    // Set the wait delay (in seconds)
                    this.wait_delay = Config.team.click_delay;

                    // Set a countdown that will subtract from the delay every second.
                    let interval = setInterval(() => {

                        if(this.wait_delay != 0) {

                            // Update the wait message.
                            this.wait_message = `Gelieve ${this.wait_delay}s te wachten.`

                            this.wait_delay -= 1;
                        } else {

                            // Remove the wait message.
                            this.wait_message = ""

                            // Remove the interval.
                            clearInterval(interval);
                        }
                    }, 1000);
            }
        }
    };
</script>

<style scoped>
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


