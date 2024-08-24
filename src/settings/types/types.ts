export type EnvVariableType = { [key: string]: string | undefined };

export type NodeMailerAgentSettingsType = {
  address: string;
  name: string;
  password: string;
};

export type NodeMailerSettingsType = {
  MAIL_SERVICE: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_SECURE: boolean;
  MAIL_IGNORE_TLS: boolean;
  MAIL_AGENT_SETTINGS: NodeMailerAgentSettingsType;
};

export type JWTOptionsType = {
  SECRET: string;
  EXPIRES: string;
};

export type JWTTokensSettingsType = {
  ACCESS_TOKEN: JWTOptionsType;
  REFRESH_TOKEN: JWTOptionsType;
};

export type SuperAdminAuthType = {
  login: string;
  password: string;
};

export type UuidOptionsType = {
  [key: string]: {
    prefix: string;
    key: string;
  };
};

export type StaticOptionsType = {
  uuidOptions: UuidOptionsType;
};
