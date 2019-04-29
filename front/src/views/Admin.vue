<template>
  <v-dialog v-model="showDialog" persistent max-width="700">

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
                  <v-btn color="primary" raised v-on="on" @click.stop="addTeamDialog = true">Toevoegen</v-btn>
                  <v-btn color="error" raised v-on="on" @click.stop="addTeamDialog = false">Reset count</v-btn>
                  <v-btn color="info" raised @click.stop="toggleBoxxy">Toggle boxxy updates</v-btn>
                  <span>Toggled: {{ isBoxxyToggled }}</span>
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
    <div>
    <v-card v-if="addTeamDialog">
      <v-card-title class="headline">Voeg een team toe.</v-card-title>
      <v-card-text>
        <v-form ref="formAddTeam" v-model="valid" lazy-validation>
            <v-text-field v-model="teamName" label="Team Name" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" flat @click="showDialog = false">Close</v-btn>
          <v-btn color="green darken-1" flat @click="showDialog = false">Add</v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="!addTeamDialog">
        <v-card-title class="headline">Reset manual count</v-card-title>

        <v-card-text>
          Resetting the manual count will save the current scores, create a new database and restart the server.
        </v-card-text>
  
        <v-card-actions>
          <v-spacer></v-spacer>
  
          <v-btn
            color="green darken-1"
            flat="flat"
            @click="showDialog = false"
          >
            Cancel
          </v-btn>
  
          <v-btn
            color="green darken-1"
            flat="flat"
            @click="showDialog = false; reset()"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import TeamList from "../components/TeamList.vue";

import { adminManager } from "../team/AdminManager";

export default {
    name: "Admin",
    components: {
        TeamList
    },
    data: () => ({
        showDialog: false,
        addTeamDialog: false,
        teamName: "",
        isBoxxyToggled: false
    }),
    methods: {
        addTeam() {
            // Validate the team on the client side.
            if (this.$refs.formAddTeam.validate()) {
                this.snackbar = true;
            }
        }, reset(){
            adminManager.resetManualCount();
        }, toggleBoxxy(){
            let self = this;
            adminManager.toggleBoxxyUpdates().then((response) => {
              console.log("Boxxy toggle succes, new state: " + response.data);
              self.isBoxxyToggled = response.data;
              
        });
    }
    }, created(){
        adminManager.areBoxxyUpdatesOn().then((response) => {
            this.isBoxxyToggled = response.data;
        });
    }
};
</script>

