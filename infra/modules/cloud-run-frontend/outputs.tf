output "artifact_registry_repository_id" {
  description = "Artifact Registry repository id."
  value       = google_artifact_registry_repository.frontend.repository_id
}

output "artifact_registry_repository_url" {
  description = "Docker repository URL."
  value       = "${local.artifact_registry_location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.frontend.repository_id}"
}

output "cloud_run_service_name" {
  description = "Cloud Run service name."
  value       = google_cloud_run_v2_service.frontend.name
}

output "cloud_run_service_url" {
  description = "Cloud Run service URL."
  value       = google_cloud_run_v2_service.frontend.uri
}

output "runtime_service_account_email" {
  description = "Runtime service account email."
  value       = local.runtime_service_account_email
}
