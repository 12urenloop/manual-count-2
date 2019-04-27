<template>
  <v-dialog v-model="dialogAdd" persistent max-width="700">
    <template v-slot:activator="{ on }">
      <v-layout wrap>
        <v-flex xs12>
          <v-card>
            <v-card-title primary-title>
              <v-layout wrap align-content-space-between>
                <v-flex xs6>
                  <h3 class="headline">Teams</h3>
                </v-flex>
                <v-flex xs6>
                  <v-btn color="primary" raised v-on="on">Toevoegen</v-btn>
                </v-flex>
              </v-layout>
            </v-card-title>

            <v-card-text>
              <TeamList/>
            </v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </template>
    <v-card>
      <v-card-title class="headline">Voeg een team toe.</v-card-title>
      <v-card-text>
        <v-form ref="formAddTeam" v-model="valid" lazy-validation>
          <v-text-field v-model="teamName" label="Team Name" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" flat @click="dialogAdd = false">Close</v-btn>
        <v-btn color="green darken-1" flat @click="dialogAdd = false">Add</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import TeamList from "../components/TeamList.vue";

export default {
  name: "Admin",
  components: {
    TeamList
  },
  data: () => ({
    dialogAdd: false
  }),
  methods: {
    addTeam() {
      // Validate the team on the client side.
      if (this.$refs.formAddTeam.validate()) {
        this.snackbar = true;
      }
    }
  }
};
</script>

