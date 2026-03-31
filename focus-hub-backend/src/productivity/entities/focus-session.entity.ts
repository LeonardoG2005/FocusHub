import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/user.entity';
import { Technique } from './technique.entity';
import { FocusSessionTask } from './focus-session-task.entity';

@Entity('focus_sessions')
export class FocusSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.focusSessions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Technique, (technique) => technique.focusSessions, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'techniques_id' })
  technique: Technique;

  @Column({ type: 'varchar', length: 50, default: 'in_progress' })
  status: 'in_progress' | 'paused' | 'completed';

  @Column({ type: 'int', default: 0, nullable: false })
  elapsedSeconds: number = 0;

  @Column({ type: 'datetime', nullable: true })
  pausedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
  
  @OneToMany(() => FocusSessionTask, (focusSessionTask) => focusSessionTask.focusSession, { cascade: true })
  focusSessionTasks: FocusSessionTask[];
}
