locals {
  artifact_registry_location = var.artifact_registry_location != "" ? var.artifact_registry_location : var.region
  runtime_service_account_email = var.runtime_service_account_email != null ? var.runtime_service_account_email : google_service_account.runtime[0].email
  base_labels = {
    app         = var.application_name
    environment = var.environment
    managed_by  = "terraform"
  }
  merged_labels = merge(local.base_labels, var.labels)
}

resource "google_project_service" "required" {
  for_each = toset(var.required_services)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_service_account" "runtime" {
  count = var.create_runtime_service_account && var.runtime_service_account_email == null ? 1 : 0

  project      = var.project_id
  account_id   = var.runtime_service_account_id
  display_name = "Cloud Run runtime (${var.environment})"
  description  = "Runtime service account for ${var.application_name} (${var.environment})."

  depends_on = [google_project_service.required]
}

resource "google_artifact_registry_repository" "frontend" {
  project       = var.project_id
  location      = local.artifact_registry_location
  repository_id = var.artifact_registry_repository_id
  format        = "DOCKER"
  description   = "Docker repository for ${var.application_name} (${var.environment})."
  labels        = local.merged_labels

  depends_on = [google_project_service.required]
}

resource "google_artifact_registry_repository_iam_member" "runtime_reader" {
  project    = var.project_id
  location   = local.artifact_registry_location
  repository = google_artifact_registry_repository.frontend.repository_id
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${local.runtime_service_account_email}"
}

resource "google_cloud_run_v2_service" "frontend" {
  name     = var.cloud_run_service_name
  project  = var.project_id
  location = var.region
  ingress  = var.ingress
  labels   = local.merged_labels

  deletion_protection = var.deletion_protection

  template {
    service_account = local.runtime_service_account_email
    timeout         = "${var.request_timeout_seconds}s"

    max_instance_request_concurrency = var.container_concurrency

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }

    containers {
      image = var.bootstrap_container_image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      dynamic "env" {
        for_each = var.runtime_env_vars
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image
    ]
  }

  depends_on = [google_artifact_registry_repository_iam_member.runtime_reader]
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  count = var.allow_unauthenticated ? 1 : 0

  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
