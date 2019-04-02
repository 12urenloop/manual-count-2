<template>
    <v-layout wrap>
        <Team v-for="team in teams" :key="team.name" :name="team.name" :count="team.count"/>
    </v-layout>
</template>

<script>
    import Team from "../components/Team.vue";
    import axios from "axios";
    import Config from "../config";

    export default {
        name: "Home",
        components: {
            Team
        },
        data() {
            return {
                teams: [
                    {
                        name: "1",
                        count: 0
                    },
                    {
                        name: "2",
                        count: 0
                    },
                    {
                        name: "3",
                        count: 1
                    }
                ]
            };
        },

        created: () => {
            // Send a request to the server every second for every addition in the queue.
            let interval = setInterval(() => {
                
                // Go over every count in the queue.
                for (let counter of this.$store.state.queue) {
                    axios
                        .post(Config.endpoints.addition)

                        .then(function(response) {
                            
                            // Remove the addition from the queue list.
                            delete this.$store.state[this.$store.state.queue.index(counter)]
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                }
            }, 1000);
        }
    };
</script>

