output "artifact_registry_repository_url" {
  description = "Artifact Registry URL for container images."
  value       = module.frontend.artifact_registry_repository_url
}

output "cloud_run_service_url" {
  description = "Public URL of develop service."
  value       = module.frontend.cloud_run_service_url
}

output "runtime_service_account_email" {
  description = "Runtime service account used by Cloud Run."
  value       = module.frontend.runtime_service_account_email
}
