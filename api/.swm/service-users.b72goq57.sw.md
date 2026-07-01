---
title: '[Service] Users'
---
USER Registration

Once the user is registered from the FE trough cognito, then it makes a call to the API to create a user on our DB. This user will contain only basic info

<SwmSnippet path="/src/users/users.service.ts" line="68">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

\[POST\] /users

```postman_json
{
    "age": "",
    "city": "",
    "cognitoId": "7997e3ae-eadb-4d6e-8633-22e8dd879cf0",
    "country": "",
    "diagnosisSubTypes": null,
    "diagnosisTypes": null,
    "diagnosisYear": "",
    "displayName": "Test test",
    "email": "jamot67715@pariag.com",
    "firstName": "Test test",
    "gender": "",
    "geoLocation": {
        "latitude": 0,
        "longitude": 0
    },
    "lastName": null,
    "phoneNumber": "0000000000",
    "profilePicture": null,
    "role": null,
    "zipCode": ""
}
```

Then, once the user fills all fields from the form, we perfom an update to the DB

UPDATE User\
\[PUT\] /users

<SwmSnippet path="/src/users/users.service.ts" line="171">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

Sample Payload

```postman_json
{
    "cognitoId": "38a5e533-479e-4655-81f4-1990cd44bd24",
    "email": "ezequiel@oneseventech.com",
    "displayName": "Ezequiel",
    "firstName": "Ezequiel",
    "lastName": "Minutto",
    "designation": {
        "id": "18e19ab1-4ca0-46c6-ad0e-cfb4b6994ce4"
    },
    "role": {
        "id": "3c42b2cb-5bb4-49f9-ac8d-8f0d567ec2b5"
    },
    // "diagnosisTypes": ["16940220-3db5-4633-93de-9b9527aa280b"],
    "city": "FOR",
    "country": "BZ",
    "zipCode": "1406",
    "age": "22",
    "gender": "male",
    "geoLocation": {
        "latitude": 37.779379,
        "longitude": -122.418433
    }
}
```

GET Users: \[GET\] /users

GET Users by cognito id: \[GET\] /users/getUserInfoByCognitoId/:cognitoId

DELETE User: \[DELETE\] /users \[passing token\]

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBbGF1cmllc2xvdmUtYXBpJTNBJTNBTGF1cmllLXMtTG92ZQ==" repo-name="laurieslove-api"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
