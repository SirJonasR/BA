variable "project" {
  description = "AWS Project Name"
  type        = string
  default     = "tecradar"
}

variable "environment" {
  description = "Define the environment (dev/prod)"
  type        = string
  default     = "dev"
}

variable "region" {
  description = "The region to create resources."
  type        = string
  default     = "eu-north-1"
}

variable "domain_name" {
  description = "The base domain name for the environment (e.g., dev.tecradar.atos.net or tecradar.atos.net)"
  type        = string
}

variable "db_username_root" {
  description = "The username for the database."
  default = "example_db_user"
  type        = string
  sensitive   = true
}

variable "keycloak_admin_username" {
  description = "The admin username for Keycloak."
  default = "admin"
  type        = string
  sensitive   = true
}