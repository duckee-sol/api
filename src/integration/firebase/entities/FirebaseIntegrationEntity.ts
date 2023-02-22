import { Column, CreateDateColumn, Entity, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from '~/user';

@Entity({ name: 'firebase_integration' })
export class FirebaseIntegrationEntity {
  @PrimaryColumn()
  uid: string;

  @Column()
  email: string;

  @OneToOne(() => UserEntity, { cascade: true })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}