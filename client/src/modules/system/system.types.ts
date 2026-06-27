/** يطابق DTO الخادم: Application.Common.Abstractions.SystemInfo */
export interface SystemInfo {
  name: string;
  version: string;
  environment: string;
  serverTimeUtc: string;
  supportedLanguages: string[];
}
