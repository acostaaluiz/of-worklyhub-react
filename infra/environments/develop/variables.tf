variable "project_id" {
  description = "GCP project id for develop environment."
  type        = string
}

variable "region" {
  description = "GCP region."
  type        = string
  default     = "us-central1"
}

variable "artifact_registry_repository_id" {
  description = "Artifact Registry repository id."
  type        = string
  default     = "worklyhub-frontend-dev"
}

variable "artifact_registry_location" {
  description = "Artifact Registry location. If empty, uses region."
  type        = string
  default     = ""
}

variable "cloud_run_service_name" {
  description = "Cloud Run service name."
  type        = string
  default     = "worklyhub-frontend-dev"
}

variable "runtime_service_account_email" {
  description = "Existing runtime service account email. Optional."
  type        = string
  default     = null
}

variable "create_runtime_service_account" {
  description = "Create runtime service account when runtime_service_account_email is null."
  type        = bool
  default     = true
}

variable "runtime_service_account_id" {
  description = "Account id for generated runtime service account."
  type        = string
  default     = "worklyhub-fe-dev-run"
}

variable "allow_unauthenticated" {
  description = "Expose Cloud Run publicly."
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
  description = "CPU limit per instance."
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory limit per instance."
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
  description = "Maximum concurrent requests per instance."
  type        = number
  default     = 80
}

variable "request_timeout_seconds" {
  description = "Request timeout in seconds."
  type        = number
  default     = 300
}

variable "runtime_env_vars" {
  description = "Runtime env vars for Cloud Run."
  type        = map(string)
  default     = {}
}

variable "bootstrap_container_image" {
  description = "Bootstrap image used by Terraform before CI deploy."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "deletion_protection" {
  description = "Enable deletion protection on Cloud Run."
  type        = bool
  default     = false
}
