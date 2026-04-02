import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Event } from '../../events/event.entity';

@Entity('event_reminders')
export class EventReminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  reminderTime: Date;

  @Column({ type: 'varchar', length: 50, default: 'push', nullable: false })
  notificationType: 'push' | 'desktop';

  @Column({ type: 'boolean', default: true, nullable: false })
  status: boolean;


  @OneToOne(() => Event, (event) => event.reminder)
  @JoinColumn({ name: 'events_id' })
  event: Event;
}
