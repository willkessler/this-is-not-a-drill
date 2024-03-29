import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyAuthGuard } from './api-key-auth.guard';

@Injectable()
export class EitherJWTorDevApiKeyAuthGuard implements CanActivate {
  constructor(private reflector: Reflector,
              private jwtAuthGuard: JwtAuthGuard,
              private apiKeyAuthGuard: ApiKeyAuthGuard) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return new Promise(async (resolve, reject) => {
            let jwtSuccess, apiKeySuccess, jwtError, apiKeyError, apiKeyIsDevKey;
            try {
                //console.log('canActivate: checking JWT');
                jwtSuccess = await this.jwtAuthGuard.canActivate(context);
                //console.log(`canActivate: JTW results ${jwtSuccess}`);
            } catch (error) {
                jwtSuccess = false;
                jwtError = error;
            }

            try {
                //console.log('canActivate: checking API key');
                apiKeySuccess = await this.apiKeyAuthGuard.canActivate(context);
                //console.log(`canActivate: api key results ${apiKeySuccess}`);
                apiKeyIsDevKey = this.apiKeyAuthGuard.isApiKeyDevelopment(context);
            } catch (error) {
                apiKeySuccess = false;
                apiKeyError = error;
            }

            if (jwtSuccess || (apiKeySuccess && apiKeyIsDevKey)) {
                if (jwtSuccess) {
                    console.log('EitherJWTorDevApiKeyAuthGuard: JWT auth method succeeded.');
                } else {
                    console.log('EitherJWTorDevApiKeyAuthGuard: API key auth method succeeded and key is Development key type.');
                }
                resolve(true);
                return;
            } else {
                console.log('Neither JWT nor API key auth methods succeeded:');
                console.log(`JWT Error: ${jwtError}`);
                console.log(`API key Error: ${apiKeyError}`);
            
                reject(new UnauthorizedException('Access Denied'));
            }
        });
    }
}
