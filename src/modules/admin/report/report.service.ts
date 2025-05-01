import { Injectable } from '@nestjs/common';
import { User } from 'src/modules/user/entities/user.entity';
import { Report } from './entities/report.entity';
import { Suspension } from './entities/suspensions';

@Injectable()
export class ReportService {}
