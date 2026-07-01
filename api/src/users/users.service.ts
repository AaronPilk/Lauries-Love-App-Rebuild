import { Notification, NotificationChange, NotificationObject, User, ValuesDefinition } from '@app/database/entities';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { UpdateCognitoUserDto } from './dto/UpdateCognitoUserDTO';
import {
  AdminUpdateUserAttributesRequest,
  AttributeListType,
  AdminCreateUserRequest,
  AdminDeleteUserRequest,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { AdminCreateUserInput } from './dto/admin-create-user.dto';
import { CreateUser } from './dto/createUser.dto';
import { FriendRequest } from '@app/database/entities/friend-request.entity';
import { FriendRequestStatus } from 'src/common/enums/friend-request-status.enum';
import { randomUUID } from 'crypto';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as crypto from 'crypto';
import { SendBirdService } from 'src/service/sendbird/sendbird.service';
import { SearchMessageDto } from 'src/service/sendbird/dto/search-message.dto';
import { S3Service } from 'src/service/aws/s3.service';
import { v4 as uuidv4 } from 'uuid';

const userRelations = [
  'designation',
  'role',
  'diagnosisSubTypes',
  'diagnosisTypes',
];
@Injectable()
export class UsersService extends TypeOrmCrudService<User> {
  private userPool = process.env.COGNITO_USER_POOL_ID;

  cognitoIdentityServiceProvider: CognitoIdentityServiceProvider;
  constructor(
    @InjectRepository(User) userRepository: Repository<User>,
    @InjectRepository(Notification) 
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationChange) 
    private readonly notificationChangeRepository: Repository<NotificationChange>,
    @InjectRepository(NotificationObject) 
    private readonly notificationObjectRepository: Repository<NotificationObject>,
    @InjectRepository(FriendRequest) 
    private readonly friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(ValuesDefinition)
    private readonly valueRepository: Repository<ValuesDefinition>,
    private readonly sendBirdService: SendBirdService,
    private readonly s3Service: S3Service,
  ) {
    super(userRepository);
    this.cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async createUser(user: CreateUser) {
    try {

      let diagnosisTypes: ValuesDefinition[] = [];
      let diagnosisSubTypes: ValuesDefinition[] = [];
      let role: ValuesDefinition;

      if (user?.diagnosisTypes?.length > 0) {
        diagnosisTypes = await this.valueRepository.find({
          where: {id: In(user.diagnosisTypes),
            definitionType: { definitionType: 'DIAGNOSIS_TYPE' }
          },
          relations: ['definitionType'],
        });
      }

      // if (diagnosisTypes?.length < 1) {
      //   throw new BadRequestException('DiagnosisType not found');
      // }

      Logger.log('diagnosisType', {diagnosisTypes});

      if (user?.diagnosisSubTypes?.length > 0) {
        diagnosisSubTypes = await this.valueRepository.find({
          where: {id: In(user.diagnosisSubTypes),
            definitionType: { definitionType: 'DIAGNOSIS_SUB_TYPE' }
          },
          relations: ['definitionType'],
        });
      }
      

      // if (diagnosisSubTypes?.length < 1) {
      //   throw new BadRequestException('DiagnosisSubtypes not found');
      // }
      Logger.log('diagnosisSubTypes', {diagnosisSubTypes});
      // const designation = await this.valueRepository.findOne({
      //   where: { id: user.designation, definitionType: { definitionType: 'DIAGNOSIS_TYPE' } },
      //   relations: ['definitionType'],
      // });

      // if (!designation && designation === null) {
      //   throw new BadRequestException('Designation not found');
      // }
      // Logger.log('designation', {designation});

      if (user.role) {
        role = await this.valueRepository.findOne({
          where: { id: user.role, definitionType: { definitionType: 'USER_DESIGNATION' } },
          relations: ['definitionType'],
        });

        const superAdmin = await this.valueRepository.findOne({
          where: { 
            description: 'Super Admin', 
            definitionType: { definitionType: 'USER_ROLE' } },
          relations: ['definitionType'],
        });
  
        const roles = await this.valueRepository.find({
          where: { definitionType: { definitionType: 'USER_DESIGNATION' } },
          relations: ['definitionType'],
        });
  
        if (superAdmin) {
          roles.push(superAdmin);
        }
      }


      
      // if (roles.filter((r) => r.id === user.role).length < 1) {
      //   throw new BadRequestException(`Role id: ${user.role} not found`);
      // }
      Logger.log('role', {role});
      const newUser = new User();
      newUser.active = true;
      newUser.cognitoId = user.cognitoId;
      newUser.displayName = user.displayName;
      newUser.firstName = user.firstName;
      newUser.lastName = user.lastName;
      newUser.email = user.email;
      newUser.phoneNumber = user.phoneNumber;
      newUser.country = user.country;
      newUser.city = user.city;
      newUser.zipCode = user.zipCode;
      newUser.diagnosisYear = user.diagnosisYear;
      // newUser.designation = designation;
      newUser.role = role;
      newUser.diagnosisTypes = diagnosisTypes;
      newUser.diagnosisSubTypes = diagnosisSubTypes;
      newUser.age = user.age;
      newUser.gender = user.gender;
      newUser.config = user.config;
      newUser.geoLocation = user.geoLocation;
      newUser.profilePicture = user.profilePicture;
      return this.repo.save(newUser);
    } catch (error) {
      Logger.error('this is the error', error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateUserNew(dto: UpdateUserDTO) {
    try {
      const existingUser = await this.repo.findOne({ where: { id: dto.id } });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      const newUser = existingUser;

      if (dto.diagnosisTypes && dto.diagnosisTypes?.length > 0) {
        const types = await this.valueRepository.find({ where: {
          id: In(dto.diagnosisTypes),
          definitionType: { definitionType: 'DIAGNOSIS_TYPE' }},
          relations: ['definitionType'],
        });

        Logger.log('diagnosisTypes', {types});
        newUser.diagnosisTypes = types?.length > 0 ? types : existingUser.diagnosisTypes;
      }

      if (dto.diagnosisSubTypes && dto.diagnosisSubTypes?.length > 0) {
        const subTypes = await this.valueRepository.find({ where: {
          id: In(dto.diagnosisSubTypes), 
          definitionType: { definitionType: 'DIAGNOSIS_SUB_TYPE' }},
          relations: ['definitionType'],
        });

        Logger.log('diagnosisSubType', {subTypes});
        newUser.diagnosisSubTypes = subTypes?.length > 0 ? subTypes : existingUser.diagnosisSubTypes;
      }

      if (dto.designation) {
        newUser.designation = await this.valueRepository.findOne({
          where: { id: dto.designation.id, },
        });
      }
      if (dto.role) {
        const superAdmin = await this.valueRepository.findOne({
          where: { 
            description: 'Super Admin', 
            definitionType: { definitionType: 'USER_ROLE' } },
          relations: ['definitionType'],
        });
  
        const roles = await this.valueRepository.find({
          where: { definitionType: { definitionType: 'USER_DESIGNATION' } },
          relations: ['definitionType'],
        });

        if (superAdmin) {
          roles.push(superAdmin);
        }
        
        const newRole = roles.filter((r) => r.id === dto.role.id);
        newUser.role = roles.filter((r) => r.id === dto.role.id)?.length > 0 ? newRole[0] : existingUser.role;
        Logger.log('newUserRole', {role: newUser.role});
      }
      newUser.cognitoId = dto.cognitoId ?? existingUser.cognitoId;
      newUser.displayName = dto.displayName ?? existingUser.displayName;
      newUser.firstName = dto.firstName ?? existingUser.firstName;
      newUser.lastName = dto.lastName ?? existingUser.lastName;
      newUser.email = dto.email ?? existingUser.email;
      newUser.phoneNumber = dto.phoneNumber ?? existingUser.phoneNumber;
      newUser.country = dto.country ?? existingUser.country;
      newUser.zipCode = dto.zipCode ?? existingUser.zipCode;
      newUser.diagnosisYear = dto.diagnosisYear ?? existingUser.diagnosisYear;
      newUser.age = dto.age ?? existingUser.age;
      newUser.gender = dto.gender ?? existingUser.gender;
      newUser.config = dto.config ?? existingUser.config;
      newUser.geoLocation = dto.geoLocation ?? existingUser.geoLocation;
      newUser.profilePicture = dto.profilePicture !== undefined ? dto.profilePicture : existingUser.profilePicture;
      newUser.addressLine1 = dto.addressLine1 ?? existingUser.addressLine1;
      // newUserInfo.addressLine2 = user.addressLine2 ?? newUserInfo.addressLine2;
      newUser.city = dto.city ?? existingUser.city;
      newUser.country = dto.country ?? existingUser.country;
      newUser.description = dto.description ?? existingUser.description;
      newUser.diagnosisDate = dto.diagnosisDate ?? existingUser.diagnosisDate;
      newUser.dob = dto.dob ?? existingUser.dob;
      newUser.timeline = dto.timeline ?? existingUser.timeline;
      newUser.updatedAt = new Date();

      Logger.log('user Update', {newUser}); 
      await this.repo.save(newUser);
      try {
        await this.updateCognitoUser(newUser);
      } catch (error) {
        throw new Error(error);
      }
      return await this.repo.findOneOrFail({
        where: { id: dto.id },
        relations: userRelations,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  /***
   * To update Profile Information user fields
   */
  async updateUser(user: User) {
    try {
      const newUserInfo = await this.repo.findOne({ where: { id: user.id } });
      if (user.diagnosisTypes && user.diagnosisTypes.length > 0) {
        newUserInfo.diagnosisTypes = await this.valueRepository.findBy({
          id: In(user.diagnosisTypes),
        });
      }
      if (user.diagnosisSubTypes && user.diagnosisSubTypes.length > 0) {
        newUserInfo.diagnosisSubTypes = await this.valueRepository.findBy({
          id: In(user.diagnosisSubTypes),
        });
      }
      if (user.designation) {
        newUserInfo.designation = await this.valueRepository.findOne({
          where: { id: user.designation.id },
        });
      }
      if (user.role) {
        newUserInfo.role = await this.valueRepository.findOne({
          where: { id: user.role.id },
        });
      }
      newUserInfo.cognitoId = user.cognitoId ?? newUserInfo.cognitoId;
      newUserInfo.displayName = user.displayName ?? newUserInfo.displayName;
      newUserInfo.firstName = user.firstName ?? newUserInfo.firstName;
      newUserInfo.lastName = user.lastName ?? newUserInfo.lastName;
      newUserInfo.email = user.email ?? newUserInfo.email;
      newUserInfo.phoneNumber = user.phoneNumber ?? newUserInfo.phoneNumber;
      newUserInfo.country = user.country ?? newUserInfo.country;
      newUserInfo.zipCode = user.zipCode ?? newUserInfo.zipCode;
      newUserInfo.diagnosisYear =
        user.diagnosisYear ?? newUserInfo.diagnosisYear;
      newUserInfo.age = user.age ?? newUserInfo.age;
      newUserInfo.gender = user.gender ?? newUserInfo.gender;
      newUserInfo.config = user.config ?? newUserInfo.config;
      newUserInfo.geoLocation = user.geoLocation ?? newUserInfo.geoLocation;
      newUserInfo.profilePicture =
        user.profilePicture ?? newUserInfo.profilePicture;
      newUserInfo.addressLine1 = user.addressLine1 ?? newUserInfo.addressLine1;
      newUserInfo.addressLine2 = user.addressLine2 ?? newUserInfo.addressLine2;
      newUserInfo.city = user.city ?? newUserInfo.city;
      newUserInfo.country = user.country ?? newUserInfo.country;
      newUserInfo.description = user.description ?? newUserInfo.description;
      newUserInfo.diagnosisDate =
        user.diagnosisDate ?? newUserInfo.diagnosisDate;
      newUserInfo.dob = user.dob ?? newUserInfo.dob;
      newUserInfo.timeline = user.timeline ?? newUserInfo.timeline;
      newUserInfo.updatedAt = new Date();
      try {
        await this.repo.save(newUserInfo);
        await this.updateCognitoUser(user);
        Logger.log('User updated successfully');
      } catch (error) {
        throw new Error(error);
      }
      return await this.repo.findOneOrFail({
        where: { id: user.id },
        relations: userRelations,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateCognitoUser(userDto: UpdateCognitoUserDto): Promise<any> {
    if (userDto.email || userDto.firstName || userDto.lastName) {
      const attributesToBeUpdates: CognitoIdentityServiceProvider.AttributeListType =
        [];
      if (userDto.email)
        attributesToBeUpdates.push(
          {
            Name: 'preferred_username',
            Value: `${userDto.email}`,
          },
          {
            Name: 'email',
            Value: `${userDto.email}`,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        );
      if (userDto.firstName)
        attributesToBeUpdates.push({
          Name: 'given_name',
          Value: `${userDto.firstName}`,
        });
      if (userDto.lastName)
        attributesToBeUpdates.push({
          Name: 'family_name',
          Value: `${userDto.lastName}`,
        });
      const dbUser = await this.repo.findOne({
        where: { id: userDto.id },
        select: ['cognitoId'],
      });
      await this.updateUserAttributes(dbUser.cognitoId, attributesToBeUpdates);
    }
  }

  async updateUserAttributes(
    username: string,
    attributeListType: AttributeListType,
  ): Promise<any> {
    const params: AdminUpdateUserAttributesRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username,
      UserAttributes: attributeListType,
    };

    return new Promise((resolve, reject) => {
      this.cognitoIdentityServiceProvider.adminUpdateUserAttributes(
        params,
        function (error, data) {
          if (error) {
            console.log(
              'Cognito error updating cognito attributes: ',
              error,
              error.stack,
            );
            reject(error);
          } else {
            console.log('updating cognito attributes', data);
            resolve(data);
          }
        },
      );
    });
  }

  async adminCreateUser({
    email,
    name,
    role,
  }: AdminCreateUserInput): Promise<any> {
    const params: AdminCreateUserRequest = {
      UserPoolId: this.userPool,
      Username: email,
      UserAttributes: [
        {
          Name: 'preferred_username',
          Value: `${email}`,
        },
        {
          Name: 'email',
          Value: `${email}`,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'profile',
          Value: role === 'ADMIN' ? 'Admin' : 'User',
        },
      ],
    };
    const cognitoUser = await this.cognitoIdentityServiceProvider
      .adminCreateUser(params)
      .promise();

    await this.cognitoIdentityServiceProvider
      .adminAddUserToGroup({
        GroupName: role === 'ADMIN' ? 'Admin' : 'User',
        UserPoolId: this.userPool,
        Username: cognitoUser.User.Username,
      })
      .promise();

    const valueDefinition = await this.valueRepository.findOne({
      where: {
        definitionType: {
          definitionType: 'USER_ROLE',
        },
        valueDefinition: role === 'ADMIN' ? '020' : '010',
      },
    });
    if (!valueDefinition) {
      throw new NotFoundException('Role not found');
    }
    const user = this.repo.create({
      email,
      cognitoId: cognitoUser.User.Username,
      firstName: name,
      role: valueDefinition,
      displayName: name,
    });

    await this.repo.save(user);

    return { ok: true, item: user };
  }
  /**
   * Find user information by cognitoId
   * @param cognitoId
   * @returns user
   */
  async findUserByCognitoId(cognitoId: string) {
    return this.repo.findOne({
      where: {
        cognitoId: cognitoId,
      },
      relations: userRelations,
    });
  }

  async deleteUser(userId: string, accessToken: string) {
    const user = await this.repo.findOne({
      where: [
        { id: userId }, { cognitoId: userId }],
        relations: ['payments'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Logger.log('deleting token', accessToken);
    const friendRequests = await this.friendRequestRepository.find({ where: 
      [
      { sender: { id: user.id }  },
      { receiver: { id: user.id } }
    ]});
    const notifications = await this.notificationRepository.find({ where: { notifier: { id: user.id } } });
    const notificationsChange = await this.notificationChangeRepository.find({ where: { actor: { id: user.id } } });

    const params: AdminDeleteUserRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: user.cognitoId,
    };
    Logger.log('deleting user', {user});

    try {
      await this.cognitoIdentityServiceProvider.deleteUser({
        AccessToken: accessToken,
      }).promise();
      
      // deleting friend requests
      if (friendRequests?.length > 0) {
          await this.friendRequestRepository.remove(friendRequests);
        }

        if (notifications?.length > 0) {
          await this.notificationRepository.remove(notifications);
        }

        if (notificationsChange?.length > 0) {
          await this.notificationChangeRepository.remove(notificationsChange);
        }
        
        // deleting user
        await this.repo.remove(user);
      }
        catch (error) {
      Logger.error('Error deleting user', error);
      throw new InternalServerErrorException(error);
    }


    return { ok: true, msg: 'Deleted User' };
  }

  async adminDelete(userId: string) {
    const user = await this.repo.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const params: AdminDeleteUserRequest = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: user.cognitoId,
    };

    await this.cognitoIdentityServiceProvider.adminDeleteUser(params).promise();

    await this.repo.remove(user);

    return { ok: true, msg: 'Deleted User' };
  }

  async sendFriendRequest(senderId: string, receiverId: string) {

    try {
      
      const sender = await this.repo.findOne({
        where: [{id: senderId}, { cognitoId: senderId }],
      });

      if (!sender) {
        throw new NotFoundException('sender not found');
      }

      const receiver = await this.repo.findOne({
        where: [{ cognitoId: receiverId }, { id: receiverId }],
      });

      if (!receiver) {
        throw new NotFoundException('receiver not found');
      }

      Logger.log('sender', {id: sender.id, cognito: sender.cognitoId});
      Logger.log('receiver', {id: receiver.id, cognito: receiver.cognitoId});

      if (sender.id === receiver.id) {
        throw new BadRequestException('You cannot send a friend request to yourself');
      }

      const existingFriendRequest = await this.friendRequestRepository.findOne({
        where: [
          { sender: { id: sender.id }, receiver: { id: receiver.id }, status: 'pending' },
          { sender: { id: sender.id }, receiver: { id: receiver.id }, status: 'accepted' }, 
          { sender: { id: receiver.id }, receiver: { id: sender.id }, status: 'pending' },
          { sender: { id: receiver.id }, receiver: { id: sender.id }, status: 'accepted' },
        ],
      });

      if (existingFriendRequest) {
        Logger.warn('Friend request already exists', {existingFriendRequest});
        return await this.friendRequestRepository.save({
          ...existingFriendRequest,
          status: 'accepted',
        });
      }

      Logger.log('ready to submit friend request', {sender: sender, receiver});
      return await this.friendRequestRepository.save({
        id: randomUUID(),
        sender: { id: sender.id },
        receiver: { id: receiver.id },
        status: 'pending',
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async updateFriendRequest(senderId: string, receiverId: string, status: FriendRequestStatus) {
    try {

      const sender = await this.repo.findOne({
        where: [{ cognitoId: senderId }, {id: senderId}],
      });

      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      const receiver = await this.repo.findOne({
        where: [{ cognitoId: receiverId }, {id: receiverId}],
      });

      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      Logger.log('sender', {id: sender.id, cognito: sender.cognitoId});
      Logger.log('receiver', {id: receiver.id, cognito: receiver.cognitoId});

      Logger.log('ready to update friend request', {receiver: receiver.id, sender: sender.id});
      const friendRequest = await this.friendRequestRepository.findOne({
        where: {
          receiver: { id: receiver.id },
          sender: { id: sender.id },
          status: 'pending',
        },
      });
      if (!friendRequest) {
        throw new NotFoundException('Friend request not found');
      }
      friendRequest.status = status;
      return await this.friendRequestRepository.save(friendRequest);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async removeFriendRequest(senderId: string, receiverId: string) {

    const sender = await this.repo.findOne({
      where: [{ cognitoId: senderId }, {id: senderId}],
    });

    const receiver = await this.repo.findOne({
      where: [{ cognitoId: receiverId }, {id: receiverId}],
    });

    
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }
    
    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    Logger.log('receiver', {id: receiver.id, cognito: receiver.cognitoId});
    Logger.log('sender', {id: sender.id, cognito: sender.cognitoId});

    try {
      const friendRequest = await this.friendRequestRepository.findOne({
        where: [
          { sender: { id: sender.id }, receiver: { id: receiver.id } },
          { sender: { id: receiver.id }, receiver: { id: sender.id  } },
        ],
      });
      if (!friendRequest) {
        throw new NotFoundException('Friend request not found');
      }
      Logger.warn('Friend request to remove', {friendRequest});
      await this.friendRequestRepository.remove(friendRequest);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getFriendRequests(receiverId: string) {
    try {
      const receiver = await this.repo.findOne({
        where: { cognitoId: receiverId },
      });
      
      if (!receiver) {
        throw new NotFoundException('receiver not found');
      }
      
      Logger.log('receiver', {id: receiver.id, cognito: receiver.cognitoId});

      return await this.friendRequestRepository.find({
        where: { receiver: { id: receiver.id }, status: 'pending' },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getFriendRequestsByUserId(senderId: string, receiverId: string) {
    try {
      const sender = await this.repo.findOne({
        where: [{ cognitoId: senderId }, { id: senderId }], 
      });

      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      const receiver = await this.repo.findOne({
        where: [{ cognitoId: receiverId }, { id: receiverId }], 
      });

      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      return await this.friendRequestRepository.find({
        where: [
          { sender: { id: sender.id }, receiver: { id: receiver.id } },
          { sender: { id: receiver.id }, receiver: { id: sender.id } },
        ],
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async generateUserHash(userId: string) {
    const secretKey = process.env.INTERCOM_SECRET_KEY;

    const hash = crypto.createHmac('sha256', secretKey).update(userId).digest('hex');

    return hash;
  }

  async getUserMessage(dto: SearchMessageDto) {
    return await this.sendBirdService.getMessages(dto);
  }

  async getSignedUrl(ext: string, userId: string) {
    const key = `${userId}-${Date.now()}.${ext}`;

    return await this.s3Service.getSignedUrl(key);
  }

  async uploadFile(file: Express.Multer.File) {
    const fileId = uuidv4();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${fileId}.${fileExtension}`;

    // Upload file to S3
    const { s3Url, key } = await this.s3Service.putObjectToS3(fileName, file.buffer, file.mimetype);

    return { s3Url, key };
  }
}
