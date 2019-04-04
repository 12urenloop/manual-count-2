<template>
    <v-data-table
        :headers="headers"
        :items="teams"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
    >
        <template v-slot:items="props">
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.status.lapCount }}</td>
        </template>
    </v-data-table>
</template>

<script>
    export default {
        name: "TeamList",
        data: () => ({
            headers: [
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
            pagination: {
                rowsPerPage: "100"
            },
            teams: new Array()
        }),
        created() {
            this.teams = this.$store.state.teamManager.teams;
        }
    };
</script>

