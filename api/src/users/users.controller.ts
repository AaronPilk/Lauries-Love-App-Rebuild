import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
  Delete,
  HttpCode,
  Headers,
  Query,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { User } from '@app/database/entities';
import { UsersService } from './users.service';
import { AllowedGroups } from '@app/auth/groups.guard';
import { AdminCreateUserInput } from './dto/admin-create-user.dto';
import { AuthUser } from '@app/auth/auth-user.decorator';
import { CognitoPayload } from '@app/auth';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { CreateUser } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { SearchMessageDto } from 'src/service/sendbird/dto/search-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Crud({
  model: {
    type: User,
  },
  query: {
    alwaysPaginate: true,
    join: {
      role: {
        alias: 'userRole',
        eager: true,
      },
      designation: { alias: 'userDesignation', eager: true },
      diagnosisTypes: { alias: 'userDiagnosisTypes', eager: true },
      diagnosisSubTypes: { alias: 'userDiagnosisSubTypes', eager: true },
    },
  },
  routes: {
    createOneBase: {
      decorators: [AllowedGroups(['public'])],
    },
  },
})
// @CrudAuth({
//   persist: (e) => {
//     if (e.method === 'POST') {
//       return {
//         creator_user_id: e.user?.sub,
//         created_at: new Date(),
//       };
//     }
//     return {
//       modifier_user_id: e.user?.sub,
//       updated_at: new Date(),
//     };
//   },
// })
@Controller('users')
export class UsersController implements CrudController<User> {
  constructor(public service: UsersService) {}
  private readonly logger = new Logger(UsersController.name);

  get base(): CrudController<User> {
    return this;
  }

  @Post()
  @AllowedGroups(['public'])
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async createUser(@Body() userInfo: CreateUser) {
    try {
      const response = await this.service.createUser(userInfo);
      return response;
    } catch (error) {
      this.logger.error('Error creating user: ' + JSON.stringify(error));
      throw new HttpException(
        'Internal Service Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async updateOne(@Param('id') userId: string, @Body() userInfo: UpdateUserDTO) {
    try {
      userInfo.id = userId;
      const response = await this.service.updateUserNew(userInfo);
      return response;
    } catch (error) {
      this.logger.error('Error updating user: ' + JSON.stringify(error));
      throw new HttpException(
        'Internal Service Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  // @AllowedGroups(['public'])
  async delete(@AuthUser() user: CognitoPayload, @Headers('Authorization') authHeader: string) {
    try {
      Logger.log('userSub', {user});
      const accessToken = authHeader.replace('Bearer ', '');
      Logger.log('accessToken', accessToken);
      const response = await this.service.deleteUser(
        user.sub,
        accessToken
      );
      return response;
    } catch (error) {
      this.logger.error('Error updating user: ' + JSON.stringify(error));
      throw new HttpException(
        'Internal Service Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getUserInfoByCognitoId/:cognitoId')
  // @AllowedGroups(['public'])
  async getUserInfoByCognitoId(@Param('cognitoId') cognitoId: string) {
    try {
      console.log('Getting user with cognito id: ', cognitoId);
      const user = await this.service.findUserByCognitoId(cognitoId);
      return user;
    } catch (error) {
      console.log(
        '🚀 ~ file: users.controller.ts ~ getUserInfoByCognitoId ~ UsersController ~ error',
        error,
      );
      if (error.code === 'UserNotFoundException')
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      if (error.code === 'NotAuthorizedException')
        throw new HttpException(
          'Invalid Email or Password',
          HttpStatus.UNAUTHORIZED,
        );
      throw new HttpException(
        'Error retrieving user information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Post('admin-create')
  @AllowedGroups(['Admin'])
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async adminCreateUser(@Body() adminCreateUserInput: AdminCreateUserInput) {
    return this.service.adminCreateUser(adminCreateUserInput);
  }
  @Delete('admin-create/:userId')
  @AllowedGroups(['Admin'])
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async adminDelete(@Param('userId') userId: string) {
    return this.service.adminDelete(userId);
  }

  @Get('friend-requests')
  @AllowedGroups(['user'])
  async getFriendRequest(
    @AuthUser() user: CognitoPayload
  ) {
    const receiverId = user.sub;
    return this.service.getFriendRequests(receiverId);
  }

  @Get(':receiverId/friend-requests')
  @AllowedGroups(['user'])
  async getFriendRequestByUserId(
    @Param('receiverId') receiverId: string,
    @AuthUser() user: CognitoPayload
  ) {
    const senderId = user.sub;
    return this.service.getFriendRequestsByUserId(senderId, receiverId);
  }
  
  @Post(':receiverId/friend-requests')
  @AllowedGroups(['user'])
  sendFriendRequest(@Param('receiverId') receiverId: string, @AuthUser() user: CognitoPayload) {
    Logger.log('Sending friend request from ' + user.sub + ' to ' + receiverId);
    const senderId = user.sub;
    return this.service.sendFriendRequest(senderId, receiverId);
  }

  @Put(':senderId/friend-requests')
  @AllowedGroups(['user'])
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  updateFriendRequest(
    @Param('senderId') senderId: string,
    @Body() body: UpdateFriendRequestDto,
    @AuthUser() user: CognitoPayload
  ) {
    const receiverId = user.sub;
    return this.service.updateFriendRequest(senderId, receiverId, body.status);
  }

  @Delete(':receiverId/friend-requests')
  @AllowedGroups(['user'])
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFriendRequest(
    @Param('receiverId') receiverId: string,
    @AuthUser() user: CognitoPayload,
  ) {
    const senderId = user.sub;
    return this.service.removeFriendRequest(senderId, receiverId);
  }

  @Get('intercom/user-hash')
  @AllowedGroups(['user'])
  async generateUserHash(@AuthUser() user: CognitoPayload) {
    return this.service.generateUserHash(user.sub);
  }

  @Get('signed-url')
  @AllowedGroups(['user'])
  async getSignedUrl(@Query('ext') ext: string, @Query('userId') userId: string) {
    return this.service.getSignedUrl(ext, userId);
  }
}
