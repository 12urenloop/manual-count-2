import {
  Model,
  Table,
  Column,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  BeforeCreate
} from 'sequelize-typescript';

@Table
export class Team extends Model<Team> {

  @Column
  name!: string;

  @PrimaryKey
  id!: number;

  @Column
  lapCount!: number;

  @Column
  lastBumpAt!: number;

  @BeforeCreate
  static initialize(instance: Team) {
    instance.lastBumpAt = Date.now();
    instance.lapCount = 0;
  }

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @DeletedAt
  deletedAt?: Date;
}