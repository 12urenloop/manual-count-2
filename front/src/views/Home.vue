<template>
    <v-layout wrap>
        <Team v-for="team in teams" :key="team.name" :team="team" />
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
        computed: {
            teams() {
                return this.$store.teamManager.getTeams();
            }
        }
    };
</script>

