import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmbientSoundModule } from './ambient-sound/ambient-sound.module';
import { CategoriesModule } from './categories/categories.module';
import { EventsModule } from './events/events.module';
import { RemindersModule } from './reminders/reminders.module';
import { ProductivityModule } from './productivity/productivity.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/user.entity';
import { Task } from './tasks/task.entity';
import { Category } from './categories/category.entity';
import { Event } from './events/event.entity';
import { AmbientSound } from './ambient-sound/ambient-sound.entity';
import { TaskReminder } from './reminders/entities/task-reminder.entity';
import { EventReminder } from './reminders/entities/event-reminder.entity';
import { Technique } from './productivity/entities/technique.entity';
import { FocusSession } from './productivity/entities/focus-session.entity';
import { FocusSessionTask } from './productivity/entities/focus-session-task.entity';
// import { MyLogger } from './logger.service';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'focushub.db',
      entities: [User, Task, Category, Event, AmbientSound, TaskReminder, EventReminder, Technique, FocusSession, FocusSessionTask],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    AmbientSoundModule,
    CategoriesModule,
    EventsModule,
    RemindersModule,
    ProductivityModule,
    TasksModule,
    AuthModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
