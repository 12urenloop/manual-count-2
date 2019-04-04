<template>
    <v-layout wrap>
        <v-flex xs12>
            <v-card>
                <v-card-title primary-title>
                    <div class="headline">Teams</div>
                </v-card-title>

                <v-card-text>
                    <v-data-table :headers="headers" :items="teams">
                        <template v-slot:items="props">
                            <td>{{ props.item.id }}</td>
                            <td>{{ props.item.name }}</td>
                            <td>{{ props.item.status.lapCount }}</td>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: "Teams",
        data: () => ({headers: [
                {
                    text: "ID",
                    value: "id"
                },

                {
                    text: "Name",
                    value: "name"
                },

                {
                    text: "Laps",
                    value: "laps"
                }
            ],
            teams: new Array()
        }),
        created() {
            this.teams = this.$store.state.teamManager.teams;
        }
    };
</script>
