import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import { Response } from 'express'; // ✅ express Response 타입 사용

@Controller()
export class AppController {
  @Get()
  getHome(@Res() res: Response) {
    return res.sendFile(join(__dirname, '..', 'public', 'home.html')); // ✅ `home.html`을 반환
  }
}
