import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserLoginLog } from 'src/modules/auth/loginhistory/entities/userlogin.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class LoginHistoryService {
  constructor(
    @InjectRepository(UserLoginLog)
    private loginLogRepo: Repository<UserLoginLog>,
  ) {}

  async countAll(): Promise<number> {
    return this.loginLogRepo.count();
  }

  async getLast7DaysTrend(): Promise<{ date: string; count: number }[]> {
    const today = dayjs().startOf('day');
    const results: { date: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = today.subtract(i, 'day');
      const start = day.toDate();
      const end = day.endOf('day').toDate();

      const count = await this.loginLogRepo.count({
        where: { createdAt: Between(start, end) },
      });

      results.push({ date: day.format('YYYY-MM-DD'), count });
    }

    return results;
  }
}
