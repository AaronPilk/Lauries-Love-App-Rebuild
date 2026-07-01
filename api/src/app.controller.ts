import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import * as useragent from 'express-useragent';
import { AllowedGroups } from '@app/auth/groups.guard';
@Controller('/')
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  @AllowedGroups(['public'])
  ping() {
    const deployDate = new Date(Date.now() - process.uptime() * 1000);
    return { message: 'pong', version: '1.1', dateDeploy: deployDate };
  }

  @Get('download')
  @AllowedGroups(['public'])
  redirectToAppStore(@Req() req: Request, @Res() res: Response): void {
    this.logger.debug('getHello was');
    const userAgent = useragent.parse(req.headers['user-agent']);
    if (userAgent.isMobile) {
      if (userAgent.isAndroid) {
        // Redirect to Android Play Store
        res.redirect(
          'https://play.google.com/store/apps/details?id=com.v587dd8da82c.app',
        );
      } else if (userAgent.isiPhone) {
        // Redirect to Apple App Store
        res.redirect(
          'https://apps.apple.com/co/app/lauries-love/id1624981989?l=en',
        );
      }
    } else {
      // Handle non-mobile devices
      res.status(404).send('App not available for non-mobile devices');
    }
  }
}
