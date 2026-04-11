import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Eureka } from 'eureka-js-client';

@Injectable()
export class EurekaService implements OnModuleInit, OnModuleDestroy {
  private client: Eureka;
  private readonly logger = new Logger(EurekaService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const eurekaHost = this.configService.get<string>('EUREKA_HOST', 'localhost');
    const eurekaPort = this.configService.get<number>('EUREKA_PORT', 8761);
    const appPort = this.configService.get<number>('PORT', 3001); 
    const serviceName = this.configService.get<string>('SERVICE_NAME', 'USER-SERVICE');

    this.logger.log(`Initializing Eureka Client for ${serviceName} on port ${appPort}...`);

    this.client = new Eureka({
      instance: {
        app: serviceName,
        instanceId: `${serviceName}:${appPort}`, // Updated: SERVICE-NAME:PORT format
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
        port: {
          '$': appPort,
          '@enabled': true,
        },
        vipAddress: serviceName.toLowerCase(),
        statusPageUrl: `http://localhost:${appPort}/health`,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
      },
      eureka: {
        host: eurekaHost,
        port: eurekaPort,
        servicePath: '/eureka/apps/',
        heartbeatInterval: 30000, // Updated: Consistent heartbeat interval
        registryFetchInterval: 30000, // Updated: Consistent registry fetch interval
        maxRetries: 3,
        requestRetryDelay: 2000,
      },
      logger: {
        warn: this.logger.warn.bind(this.logger),
        info: this.logger.log.bind(this.logger),
        debug: this.logger.debug.bind(this.logger),
        error: this.logger.error.bind(this.logger),
      }
    });

    this.client.start((error) => {
      if (error) {
        this.logger.error('Eureka registration failed:', error);
      } else {
        this.logger.log(`${serviceName} registered with Eureka successfully!`);
      }
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.stop((error) => {
        if (error) {
          this.logger.error('Eureka deregistration failed:', error);
        } else {
          this.logger.log('Deregistered from Eureka');
        }
      });
    }
  }
}
