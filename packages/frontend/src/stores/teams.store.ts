import { computed } from "vue";
import { useAxios } from "@vueuse/integrations/useAxios";
import { defineStore } from "pinia";
import { Team } from "../types/models/team.model";
import { UseAxiosReturn } from "@vueuse/integrations";
import { useTimeStore } from "./time.store";
import config from "../config";

export const useTeamsStore = defineStore("teams", () => {
  const timeStore = useTimeStore();

  // Fetch the teams
  const teamsQuery = useAxios<Team[]>("/teams", config.axios);

  // List with available teams
  const teams = computed(() => teamsQuery.data.value || []);

  // Add a new lap for a given team
  function addLap(id: number): UseAxiosReturn<Team> {
    return useAxios<Team>(
      `/teams/${id}/laps`,
      {
        method: "POST",
        data: {
          timestamp: timeStore.clientTime,
        },
      },
      config.axios
    );
  }

  return {
    teamsQuery,
    teams,
    addLap,
  };
});
