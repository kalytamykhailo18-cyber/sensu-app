export interface CommunicationLogsOptions {
  enabled: boolean;
  defaultLimit: number;
  minLimit: number;
  maxLimit: number;
}

export interface ProjectFeatureOptions {
  communicationLogs: CommunicationLogsOptions;
}

export interface ProjectOptions {
  features: ProjectFeatureOptions;
}

export const PROJECT_OPTIONS: ProjectOptions = {
  features: {
    communicationLogs: {
      enabled: true,
      defaultLimit: 100,
      minLimit: 10,
      maxLimit: 1000,
    },
  },
};

