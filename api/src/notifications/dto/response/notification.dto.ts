export class NotificationDTO {
    title?: string;
    body?: string;
    imageUrl?: string;
    type?: string;
    meta?: { 
        id: string,
        type: string
     };
}