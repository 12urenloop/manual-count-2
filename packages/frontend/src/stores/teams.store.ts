import { computed, registerRuntimeCompiler } from "vue";
import { useAxios } from "@vueuse/integrations/useAxios";
import { defineStore } from "pinia";
import { Team } from "../types/models/team.model";
import { useTimeStore } from "./time.store";
import config from "../config";
import { useQueueStore } from "@/src/stores/queue.store";
import { toast } from "@/src/helpers/toast";
import { socket } from "@/src/helpers/socket";
import { registerNewLap } from "../helpers/db";
import { StoredLap } from "../types/models/queue.model";

export const useTeamsStore = defineStore("teams", () => {
  const timeStore = useTimeStore();
  const queueStore = useQueueStore();

  // Fetch the teams
  const teamsQuery = useAxios<Team[]>("/teams", config.axios);

  // List with available teams
  const teams = computed(() => teamsQuery.data.value || []);

  // Add a new lap for a given team
  async function addLap(id: number) {
    try {
      const lap: StoredLap = {
        teamId: id,
        timestamp: timeStore.clientTime,
      };
      const response = await config.axios.post<BasePostResponse>(`/teams/${id}/laps`, {
        timestamp: lap.timestamp,
      });
      registerNewLap(lap);
      if (response.status === 200) {
        queueStore.flushQueue();
      }
    } catch (e: any) {
      console.log(`Failed to update laps: ${e}`);
      if (e?.request?.status === 409) {
        toast({
          type: "is-warning",
          message: `That was a bit too quick! (${id})`,
        });
      } else {
        queueStore.addToQueue({
          teamId: id,
          timestamp: timeStore.clientTime,
        });
      }
    }
  }

  function addLapFromWS(id: number) {
    const teamIdx = teams.value.findIndex(t => t.id == id);
    teams.value[teamIdx].lapsCount++;
    teams.value[teamIdx].lapsLastTimestamp = timeStore.clientTime;
    teams.value[teamIdx].disabled = true;
    // TODO: move away when moving to pull based to fix issue with early run
    setTimeout(() => {
      teams.value[teamIdx].disabled = false;
    }, 30000);
  }

  socket.on("updateTeam", (team: any) => {
    addLapFromWS(team.teamId);
  });

  return {
    teamsQuery,
    teams,
    addLap,
    addLapFromWS,
  };
});
