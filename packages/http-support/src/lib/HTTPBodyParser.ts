import type {IncomingMessage} from 'node:http';

import {XMLParser} from 'fast-xml-parser';
import qs from 'qs';
import getRawBody from 'raw-body';

import {HTTPError} from './HTTPError.js';
import {HTTPErrorCode} from './HTTPErrorCode.js';

export interface IBodyParseResult {
  body: unknown;
  raw: string;
  contentType: string;
}

export interface IBodyParserOptions {
  limit?: string | number;
  encoding?: string;
}

type BodyParser = (raw: string) => unknown;

class HTTPBodyParser {
  static registerParser(contentType: string, parser: BodyParser) {
    HTTPBodyParser.customParsers_.set(contentType, parser);
  }

  static async parse(req: IncomingMessage, options?: IBodyParserOptions): Promise<IBodyParseResult> {
    const contentTypeHeader = req.headers['content-type'] || '';
    const contentType = contentTypeHeader.split(';')[0].trim().toLowerCase();

    const raw = await getRawBody(req, {
      encoding: options?.encoding || 'utf-8',
      limit: options?.limit || '1mb',
    });

    let body: unknown;

    const customParser = HTTPBodyParser.customParsers_.get(contentType);
    if (customParser) {
      body = customParser(raw);
    } else {
      body = HTTPBodyParser.dispatchParse(contentType, raw);
    }

    return {body, raw, contentType};
  }

  private static dispatchParse(contentType: string, raw: string): unknown {
    switch (contentType) {
      case 'application/json': {
        return HTTPBodyParser.parseJSON(raw);
      }
      case 'text/xml':
      case 'application/xml': {
        return HTTPBodyParser.parseXML(raw);
      }
      case 'application/x-www-form-urlencoded': {
        return HTTPBodyParser.parseUrlencoded(raw);
      }
      default:
        return HTTPBodyParser.parseJSON(raw);
    }
  }

  private static parseJSON(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new HTTPError(HTTPErrorCode.ErrHttpBodyParseFailed, 'ERR_HTTP_BODY_PARSE_FAILED');
    }
  }

  private static parseXML(raw: string): unknown {
    try {
      const decoded = HTTPBodyParser.xmlParser_.parse(raw) as {xml: object};
      return decoded.xml;
    } catch (e) {
      throw new HTTPError(HTTPErrorCode.ErrHttpBodyParseFailed, 'ERR_HTTP_BODY_PARSE_FAILED');
    }
  }

  private static parseUrlencoded(raw: string): unknown {
    try {
      return qs.parse(raw);
    } catch (e) {
      throw new HTTPError(HTTPErrorCode.ErrHttpBodyParseFailed, 'ERR_HTTP_BODY_PARSE_FAILED');
    }
  }

  private static readonly xmlParser_ = new XMLParser();
  private static readonly customParsers_ = new Map<string, BodyParser>();
}

export {HTTPBodyParser};
