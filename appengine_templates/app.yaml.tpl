service: tobi-ui
runtime: nodejs14

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  VM_INTERNAL_URL: _VM_INTERNAL_URL
  VM_EXTERNAL_WEB_URL: _VM_EXTERNAL_WEB_URL
  VM_EXTERNAL_CLIENT_URL: _VM_EXTERNAL_CLIENT_URL
  BLAISE_API_URL: _BLAISE_API_URL

basic_scaling:
  idle_timeout: 60s
  max_instances: 10

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
