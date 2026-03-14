variable "project_id" {
  description = "GCP project id."
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run."
  type        = string
}

variable "environment" {
  description = "Environment name (development/production)."
  type        = string
}

variable "application_name" {
  description = "Application identifier used in labels."
  type        = string
  default     = "worklyhub-frontend"
}

variable "artifact_registry_repository_id" {
  description = "Artifact Registry repository id."
  type        = string
}

variable "artifact_registry_location" {
  description = "Artifact Registry location. If empty, region is used."
  type        = string
  default     = ""
}

variable "cloud_run_service_name" {
  description = "Cloud Run service name."
  type        = string
}

variable "runtime_service_account_email" {
  description = "Existing runtime service account email. If null and create_runtime_service_account=true, a new account is created."
  type        = string
  default     = null
}

variable "create_runtime_service_account" {
  description = "Creates runtime service account when runtime_service_account_email is null."
  type        = bool
  default     = true

  validation {
    condition     = var.create_runtime_service_account || var.runtime_service_account_email != null
    error_message = "Provide runtime_service_account_email when create_runtime_service_account is false."
  }
}

variable "runtime_service_account_id" {
  description = "Account id for generated runtime service account."
  type        = string
  default     = "worklyhub-frontend-run"
}

variable "allow_unauthenticated" {
  description = "Whether to allow public invoker access."
  type        = bool
  default     = true
}

variable "ingress" {
  description = "Ingress policy for Cloud Run."
  type        = string
  default     = "INGRESS_TRAFFIC_ALL"
}

variable "container_port" {
  description = "Container listening port."
  type        = number
  default     = 8080
}

variable "cpu" {
  description = "CPU limit for Cloud Run container."
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory limit for Cloud Run container."
  type        = string
  default     = "512Mi"
}

variable "min_instance_count" {
  description = "Minimum number of instances."
  type        = number
  default     = 0
}

variable "max_instance_count" {
  description = "Maximum number of instances."
  type        = number
  default     = 2
}

variable "container_concurrency" {
  description = "Maximum number of concurrent requests per instance."
  type        = number
  default     = 80
}

variable "request_timeout_seconds" {
  description = "Request timeout in seconds."
  type        = number
  default     = 300
}

variable "runtime_env_vars" {
  description = "Runtime env vars for Cloud Run service."
  type        = map(string)
  default     = {}
}

variable "bootstrap_container_image" {
  description = "Bootstrap image used by Terraform; CI deploy updates revision images."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "deletion_protection" {
  description = "Enable deletion protection on Cloud Run service."
  type        = bool
  default     = false
}

variable "required_services" {
  description = "GCP APIs required by this stack."
  type        = list(string)
  default = [
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "run.googleapis.com"
  ]
}

variable "labels" {
  description = "Additional labels."
  type        = map(string)
  default     = {}
}
