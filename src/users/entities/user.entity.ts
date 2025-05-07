import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  wallet: string;

  @Column({ nullable: true })
  apiKey: string;

  @Column({ nullable: true })
  webhookUrl: string;

  @Column({ nullable: true })
  callbackUrl: string;

  @Column({ default: true })
  isActive: boolean;
}
