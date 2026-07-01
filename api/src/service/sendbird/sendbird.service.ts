import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchMessageDto } from './dto/search-message.dto';

@Injectable()
export class SendBirdService {
  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {}

  async getMessages(option: SearchMessageDto) {
    let data = [];
    let pagination = {};
    while (true) {
      let { results, pagination: nextPagination } = await this.fetchMessages(option);
      pagination = nextPagination;

      if (results.length > 0) {
        data = data.concat(results);
      }

      if (option.limit) {
        break
      }

      if (nextPagination.has_next) {
        option.next = nextPagination.next;
      } else {
        break;
      }
    }

    return { data, ...pagination };

  }

  private async fetchMessages(option: SearchMessageDto) {
    try {
      const url = `https://api-${this.configService.get('SENDBIRD_APP_ID')}.sendbird.com/v3/search/messages`;

      const { data } = await this.httpService.axiosRef.get(url, {
        headers: {
          'Content-Type': 'application/json; charset=utf8',
          'Api-Token': `${this.configService.get('SENDBIRD_APP_TOKEN')}`,
        },
        params: {
          query: option.query,
          ...option.userId ? { user_id: option.userId } : null,
          ...option.channelUrl ? { channel_url: option.channelUrl } : null,
          ...option.limit ? { limit: option.limit } : null,
          ...option.next ? { token: option.next } : null,
        },
      });

      const { results, ...pagination } = data;

      return {results, pagination}
    } catch (error) {
      console.error('SendBird fetchMessages error: ', error.message);
      throw error;
    }
  }
}
