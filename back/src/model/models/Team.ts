import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Lap } from "./Lap";

@Entity("teams")
export class Team {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false, unique: true })
    public name: string;

    @OneToMany(type => Lap, lap => lap.team)
    public laps: Lap[];

    /**
     * Return the last lap for the team.
     */
    public getLastLap(): Lap {

        if(this.laps) {
            let lastLap = this.laps[0];

            // Go over every lap and check if the timestamp is younger.
            for(let lap of this.laps) {
                if(lap.timestamp_added >= lastLap.timestamp_added) {
                    lastLap = lap;
                }
            }

            return lastLap;
        }
    }
}