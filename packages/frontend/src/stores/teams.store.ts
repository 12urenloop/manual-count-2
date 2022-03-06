import { computed } from "vue";
import { useAxios } from "@vueuse/integrations/useAxios";
import { defineStore } from "pinia";
import { Team } from "../types/models/team.model";
import { useTimeStore } from "./time.store";
import config from "../config";

export const useTeamsStore = defineStore("teams", () => {
  const timeStore = useTimeStore();

  // Fetch the teams
  const teamsQuery = useAxios<Team[]>("/teams", config.axios);

  // List with available teams
  const teams = computed(() => teamsQuery.data.value || []);

  // Add a new lap for a given team
  async function addLap(id: number) {
    const teamIdx = teams.value.findIndex(t => t.id == id);
    try {
      const response = await config.axios.post<BasePostResponse>(
        `/teams/${id}/laps`,
        {
          timestamp: timeStore.clientTime
        },
        {
          method: "POST"
        }
      );
      if (response.status === 200) {
        teams.value[teamIdx].lapsCount++;
      }
    } catch (e) {
      console.log(`Failed to update laps: ${e}`);
    } finally {
      teams.value[teamIdx].lapsLastTimestamp = timeStore.clientTime;
      teams.value[teamIdx].disabled = true;
      setInterval(() => {
        teams.value[teamIdx].disabled = false;
      }, 15000);
    }
  }

  return {
    teamsQuery,
    teams,
    addLap
  };
});
