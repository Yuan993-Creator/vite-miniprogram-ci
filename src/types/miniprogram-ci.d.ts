declare module 'miniprogram-ci' {
  export interface ProjectConfig {
    type: 'miniProgram' | 'miniGame' | 'miniProgramPlugin' | 'miniGamePlugin';
    appid: string;
    projectPath: string;
    privateKeyPath: string;
    ignores?: string[];
  }

  export interface UploadSettings {
    es6?: boolean;
    minify?: boolean;
    autoPrefixWXSS?: boolean;
    disableUseStrict?: boolean;
    minifyWXML?: boolean;
    minifyWXSS?: boolean;
    minifyJS?: boolean;
    codeProtect?: boolean;
    [key: string]: any;
  }

  export interface UploadTaskOptions {
    project: Project;
    version: string;
    desc: string;
    setting?: UploadSettings;
    robot?: number;
    onProgressUpdate?: (info: any) => void;
  }

  export interface PreviewTaskOptions extends UploadTaskOptions {
    qrcodeFormat?: 'base64' | 'image' | 'terminal';
    qrcodeOutputDest?: string;
    pagePath?: string;
    searchQuery?: string;
    scene?: number;
  }

  export interface UploadResult {
    subPackageInfo?: Array<{
      name: string;
      size: number;
    }>;
    pluginInfo?: Array<{
      name: string;
      size: number;
    }>;
  }

  export interface CI {
    Project: new (options: ProjectConfig) => Project;
    upload: (options: UploadTaskOptions) => Promise<UploadResult>;
    preview: (options: PreviewTaskOptions) => Promise<UploadResult>;
  }

  export class Project {
    constructor(options: ProjectConfig);
  }

  const ci: CI;
  export default ci;
} 