import {
  Table,
  Model,
  Column,
  ForeignKey,
  CreatedAt
} from "sequelize-typescript";

import { Team } from "./Team.model";

@Table
export class BumpRequest extends Model<BumpRequest> {
  @ForeignKey(() => Team)
  @Column
  teamId!: number;

  @CreatedAt
  createdAt!: Date;
}