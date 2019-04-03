import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Team } from "./Team";

@Entity("laps")
export class Lap {

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(type => Team, team => team.laps)
    public team: Team;

    @Column({ nullable: false })
    public timestamp_seen: number;

    @Column({ nullable: false })
    public timestamp_added: number;
}