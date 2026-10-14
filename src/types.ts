export type UserRole = 'admin' | 'operator' | 'reviewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MetaConfig {
  configured: boolean;
  app_id: string;
  instagram_app_id: string;
  api_version: string;
  app_secret_masked: string;
  instagram_app_secret_masked: string;
  webhook_verify_token: string;
  updated_at: string | null;
  encryption_status: {
    configured: boolean;
    message: string;
  };
  user_role: UserRole;
}

export interface EnvironmentUrls {
  base_url: string;
  facebook_oauth_redirect: string;
  instagram_oauth_redirect: string;
  webhook_callback_url: string;
  data_deletion_callback_url: string;
  data_deletion_instructions_url: string;
  deauth_callback_url?: string;
  privacy_policy_url: string;
  terms_of_service_url: string;
}

export interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram';
  auth_flow: 'facebook_login' | 'instagram_login';
  account_id: string;
  account_name: string;
  username: string | null;
  profile_picture_url: string | null;
  token_type: string | null;
  token_expires_at?: string | null;
  permissions_granted?: string | null;
  metadata_json?: string | null;
  linked_page_id: string | null;
  linked_instagram_id: string | null;
  status: string;
  connected_at: string;
}

export interface InspectionResult {
  account: {
    id: string;
    account_id: string;
    account_name: string;
    platform: string;
    auth_flow: string;
    token_type: string;
    token_expires_at: string;
    connected_at: string;
    linked_instagram_id: string | null;
  };
  inspection: {
    is_valid: boolean;
    error: string | null;
    permissions_granted: string[];
    debug_token_data?: any;
    engagement_evidence?: {
      verified: boolean;
      required_permission: string;
      fan_count: number;
      followers_count: number;
      endpoint: string;
      demonstration: string;
    } | null;
    stored_metadata?: any;
  };
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  role: string | null;
  action: string;
  flow_type: string | null;
  endpoint: string;
  http_status: number;
  resource_id: string | null;
  details_json: string;
  ip: string;
  created_at: string;
}

export interface PermissionMatrixItem {
  id: string;
  featureName: string;
  flow: 'Facebook Login' | 'Instagram Login';
  permission: string;
  dependencies: string;
  hostEndpoint: string;
  tokenType: string;
  externalConfig: string;
  testCriterion: string;
  videoEvidence: string;
  officialDocUrl: string;
  consultationDate: string;
  status: 'Interface pronta' | 'Integração real validada' | 'Vídeo gravado' | 'Teste reconhecido no painel da Meta' | 'Permissão aprovada';
}
