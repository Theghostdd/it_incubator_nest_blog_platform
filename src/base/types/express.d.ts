import 'express';

declare module 'express' {
  export interface Request {
    useragent?: {
      isMobile: boolean;
      isTablet: boolean;
      isDesktop: boolean;
      isBot: boolean;
      os: string;
      platform: string;
      source: string;
    };
  }
}
