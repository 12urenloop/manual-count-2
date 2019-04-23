import { Sequelize } from 'sequelize-typescript';

import { config } from '../src/config';

import { Team } from '../src/models/Team.model';
import { BumpRequest } from '../src/models/BumpRequest.model';

async function seed() {
  const db = new Sequelize({
    operatorsAliases: false,
    storage: '',
    ...config.dbConfig,
  });

  const teams = [
    'vtk',
    'hilok',
    'vlk',
    'vek/ml',
    'wetenschappen',
    'sk',
    'vgk',
    'hk',
    'politea',
    'vrg',
    'blandinia',
    'vppk',
    'wvk',
    'hermes/veto/lila',
    'lombriosiana/vbk',
    'antilopen'
  ];


  await db.addModels([Team, BumpRequest]);
  await db.sync({ force: true });

  await Team.bulkCreate(teams.map((name) => ({
    name,
    lapCount: 0,
    lastBumpAt: 1,
  })));
}

seed().catch((err) => console.error(err));
