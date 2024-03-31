// region API
export interface TeamsRoute { }

export interface TeamsCreateRoute {
  Body: {
    name: string;
    number: number;
  };
}

export interface TeamsLapsAddRoute {
  Body: {
    timestamp: number;
  };

  Params: {
    teamId: number;
  };
}

export interface TeamsLapsRoute {
  Params: {
    teamId: number;
  };
}
// endregion
// region Schema
export interface TelraamTeam {
  id: number;
  name: string;
  jacketNr: number;
}
// endregion
