"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EurekaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EurekaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const eureka_js_client_1 = require("eureka-js-client");
let EurekaService = EurekaService_1 = class EurekaService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EurekaService_1.name);
    }
    onModuleInit() {
        const eurekaHost = this.configService.get('EUREKA_HOST', 'localhost');
        const eurekaPort = this.configService.get('EUREKA_PORT', 8761);
        const appPort = this.configService.get('PORT', 3001);
        const serviceName = this.configService.get('SERVICE_NAME', 'USER-SERVICE');
        this.logger.log(`Initializing Eureka Client for ${serviceName} on port ${appPort}...`);
        this.client = new eureka_js_client_1.Eureka({
            instance: {
                app: serviceName,
                instanceId: `${serviceName}:${appPort}`,
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
                heartbeatInterval: 30000,
                registryFetchInterval: 30000,
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
            }
            else {
                this.logger.log(`${serviceName} registered with Eureka successfully!`);
            }
        });
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.stop((error) => {
                if (error) {
                    this.logger.error('Eureka deregistration failed:', error);
                }
                else {
                    this.logger.log('Deregistered from Eureka');
                }
            });
        }
    }
};
exports.EurekaService = EurekaService;
exports.EurekaService = EurekaService = EurekaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EurekaService);
//# sourceMappingURL=eureka.service.js.map