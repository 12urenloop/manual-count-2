 import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * A small table to store valid auth token for users
 */

@Entity({ name:'tokens' })
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  /**
   * Token
   */
  @Column()
  token!: string;
}