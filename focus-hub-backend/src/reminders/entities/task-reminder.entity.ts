import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, OneToOne } from 'typeorm';
import { Task } from '../../tasks/task.entity';

@Entity('task_reminders')
@Index('tasks_id_UNIQUE', ['taskId'], { unique: true })
export class TaskReminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  reminderTime: Date;

  @Column({ type: 'varchar', length: 50, default: 'push' })
  notificationType: 'push' | 'desktop';

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToOne(() => Task, (task) => task.taskReminder, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'int', nullable: false })
  taskId: number;
}
