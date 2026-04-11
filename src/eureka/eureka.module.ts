import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EurekaService } from './eureka.service';

@Module({
  imports: [ConfigModule],
  providers: [EurekaService],
  exports: [EurekaService],
})
export class EurekaModule {}
