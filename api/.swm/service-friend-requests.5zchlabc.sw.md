---
title: '[Service] Friend Requests'
---
Get All users friend requests: \[GET\] /users/friend-requests

<SwmSnippet path="/src/users/users.service.ts" line="682">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

Get Friend Request by User Id: \[GET\] /users/:id/friend-requests

<SwmSnippet path="/src/users/users.service.ts" line="702">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

\
CREATE friend request: \[POST\] users/:receiverId/friend-requests

<SwmSnippet path="/src/users/users.service.ts" line="547">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

UPDATE Friend Request: users/:senderId/friend-requests\
Accepts or decline a friend request

<SwmSnippet path="/src/users/users.service.ts" line="603">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

sample payload

```postman_json
{
    "status": "accepted"
}
```

DELETE Friend Request: \[DELETE\] users/:receiverId/friend-requests

<SwmSnippet path="/src/users/users.service.ts" line="643">

---

&nbsp;

```typescript
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
```

---

</SwmSnippet>

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBbGF1cmllc2xvdmUtYXBpJTNBJTNBTGF1cmllLXMtTG92ZQ==" repo-name="laurieslove-api"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
