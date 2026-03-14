module "frontend" {
  source = "../../modules/cloud-run-frontend"

  project_id                      = var.project_id
  region                          = var.region
  environment                     = "development"
  application_name                = "worklyhub-frontend"
  artifact_registry_repository_id = var.artifact_registry_repository_id
  artifact_registry_location      = var.artifact_registry_location
  cloud_run_service_name          = var.cloud_run_service_name
  runtime_service_account_email   = var.runtime_service_account_email
  create_runtime_service_account  = var.create_runtime_service_account
  runtime_service_account_id      = var.runtime_service_account_id
  allow_unauthenticated           = var.allow_unauthenticated
  ingress                         = var.ingress
  container_port                  = var.container_port
  cpu                             = var.cpu
  memory                          = var.memory
  min_instance_count              = var.min_instance_count
  max_instance_count              = var.max_instance_count
  container_concurrency           = var.container_concurrency
  request_timeout_seconds         = var.request_timeout_seconds
  runtime_env_vars                = var.runtime_env_vars
  bootstrap_container_image       = var.bootstrap_container_image
  deletion_protection             = var.deletion_protection
  labels = {
    workload = "frontend"
    stage    = "development"
  }
}
