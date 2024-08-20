import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userService.getUser(email);
    if (!user || !user.enabled) {
      throw new UnauthorizedException();
    }
    const org = await this.organizationService.getOrganization(user.organizationId);
    if (!org || !org.enabled) {
      throw new UnauthorizedException();
    }
    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
