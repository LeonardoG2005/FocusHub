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
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const dbType = configService.get<string>('DB_TYPE', 'sqlite');
        const synchronize = configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true';
        const logging = configService.get<string>('DB_LOGGING', 'true') === 'true';
        const entities = [User, Task, Category, Event, AmbientSound, TaskReminder, EventReminder, Technique, FocusSession, FocusSessionTask];

        if (dbType === 'postgres' || !!databaseUrl) {
          const dbSslEnabled = configService.get<string>('DB_SSL', 'true') === 'true';

          return {
            type: 'postgres' as const,
            ...(databaseUrl
              ? { url: databaseUrl }
              : {
                  host: configService.get<string>('DB_HOST', 'localhost'),
                  port: Number(configService.get<string>('DB_PORT', '5432')),
                  username: configService.get<string>('DB_USERNAME', 'postgres'),
                  password: configService.get<string>('DB_PASSWORD', ''),
                  database: configService.get<string>('DB_NAME', 'focushub'),
                }),
            ssl: dbSslEnabled ? { rejectUnauthorized: false } : false,
            entities,
            synchronize,
            logging,
          };
        }

        return {
          type: 'sqlite' as const,
          database: configService.get<string>('SQLITE_PATH', 'focushub.db'),
          entities,
          synchronize,
          logging,
        };
      },
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
