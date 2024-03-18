service: tobi-ui
runtime: nodejs18

vpc_access_connector:
  name: projects/_PROJECT_ID/locations/europe-west2/connectors/vpcconnect

env_variables:
  VM_INTERNAL_URL: _VM_INTERNAL_URL
  VM_EXTERNAL_WEB_URL: _VM_EXTERNAL_WEB_URL
  VM_EXTERNAL_CLIENT_URL: _VM_EXTERNAL_CLIENT_URL
  BLAISE_API_URL: _BLAISE_API_URL
  BIMS_API_URL: _BIMS_API_URL
  BIMS_CLIENT_ID: _BIMS_CLIENT_ID

automatic_scaling:
  min_instances: _MIN_INSTANCES
  max_instances: _MAX_INSTANCES
  target_cpu_utilization: _TARGET_CPU_UTILIZATION

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
