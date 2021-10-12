import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Team } from "./team.model";

@Entity({ name: "laps" })
export class Lap extends BaseEntity {
  /**
   * Primary ID of the lap.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Team linked to the lap.
   */
  @ManyToOne(() => Team, (team) => team.laps)
  team!: Team;

  /**
   * UNIX Timestamp when the lap was counted.
   * (UNIX Timestamps are independent of the timezone so they are always UTC)
   */
  @Column()
  timestamp!: number;
}
