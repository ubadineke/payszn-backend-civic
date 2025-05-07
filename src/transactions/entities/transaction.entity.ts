import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  signature: string;

  @Column()
  sender: string;

  @Column()
  receiver: string;

  @Column()
  amount: string;

  @Column({ default: false })
  confirmed: boolean;
}
