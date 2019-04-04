<template>
    <v-layout wrap justify-center>
        <Team v-for="team in teams" :key="team.name" :team="team"/>
    </v-layout>
</template>

<script>
    import axios from "axios";
    import Config from "../config";
    import Team from "../components/Team.vue";

    export default {
        name: "Home",
        components: {
            Team
        },
        data: () => ({
            teams: new Array()
        }),
        created() {
            this.teams = this.$store.state.teamManager.teams;
        }
    };
</script>

