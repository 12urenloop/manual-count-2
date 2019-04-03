import {
  Model,
  Table,
  Column,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  AfterCreate
} from 'sequelize-typescript';

@Table
export class Team extends Model<Team> {

  @Column
  name!: string;

  @PrimaryKey
  @Column
  id!: number;

  @Column
  lapCount!: number;

  @Column
  lastBumpAt!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;
}