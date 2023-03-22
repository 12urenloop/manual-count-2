import { AfterLoad, BaseEntity, Column, Entity, Equal, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lap } from "./lap.model";

@Entity({ name: "teams" })
export class Team extends BaseEntity {
  /**
   * Primary ID of the team.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Name of the team.
   */
  @Column({ unique: true })
  name!: string;

  /**
   * List of counted laps for the team.
   * This does not include duplicate counts!
   */
  @OneToMany(() => Lap, lap => lap.team)
  laps!: Lap[];

  /**
   * Total number of laps for the team.
   * (Computed Value)
   */
  lapsCount: number;

  /**
   * Timestamp of the last lap for the team.
   * (Computed Value)
   */
  lapsLastTimestamp: number | undefined;

  /**
   * Calculate the laps amount.
   * This function is executed during each find() or similar functions.
   */
  @AfterLoad()
  async calculateLapsCount() {
    this.lapsCount = await Lap.count({ where: { team: Equal(this) } });
  }

  /**
   * Calculate the last lap timestamp.
   * This function is executed during each find() or similar functions.
   */
  @AfterLoad()
  async calculateLapsLastTimestamp() {
    const lastLap = await Lap.findOne({ where: { team: Equal(this) }, order: { timestamp: "DESC" } });

    this.lapsLastTimestamp = lastLap?.timestamp || 0;
  }
}
