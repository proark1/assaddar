create table if not exists portal_integration_settings (
  key text primary key,
  encrypted_value text not null default '',
  value_hint text not null default '',
  updated_by text references portal_users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint portal_integration_settings_key_check check (
    key in (
      'openai_api_key',
      'openai_model',
      'anthropic_api_key',
      'claude_model',
      'gemini_api_key',
      'gemini_model',
      'grok_api_key',
      'grok_model',
      'grok_api_base',
      'resend_api_key',
      'contact_from_email',
      'crm_from_email',
      'resend_webhook_secret'
    )
  )
);

create index if not exists portal_integration_settings_updated_at_idx
  on portal_integration_settings(updated_at desc);

alter table portal_integration_settings enable row level security;

drop policy if exists "portal service role full access"
  on portal_integration_settings;

create policy "portal service role full access"
  on portal_integration_settings for all to service_role using (true) with check (true);
