<template>
  <v-data-table
    :headers="headers"
    :items="teams"
    :pagination.sync="pagination"
      >
    <!--:rows-per-page-items="rowsPerPageItems"-->

    <template v-slot:items="props">
      <td>{{ props.item.id }}</td>
      <td>{{ props.item.name }}</td>
      <td>{{ props.item.status.lapCount }}</td>
    </template>
  </v-data-table>
</template>

<script>
import { mapState } from "vuex";

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
    //teams: new Array()
  }),
  computed: mapState({
    teams(state) {
      return Object.values(state.teams);
    }
  })
};
</script>

