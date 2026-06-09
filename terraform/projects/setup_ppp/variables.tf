variable "account_id" {
  description = "ID of AWS Account"
  type        = string
  default     = "123456789"
}

variable "project" {
  description = "AWS Project Name"
  type        = string
  default     = "PPP"
}

variable "region" {
  description = "The region to create resources."
  type        = string
  default     = "eu-north-1"
}

variable "aws_access_key" {
  description = "The aws access key."
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "The aws secret key."
  type        = string
  sensitive   = true
}

variable "ppp_backend_repo" {
  description = "Backend Repo PPP"
  type        = string
  default     = "ppp_repo_backend"
}

variable "ppp_frontend_repo" {
  description = "Frontend Repo PPP"
  type        = string
  default     = "ppp_repo_frontend"
}

variable "ppp_keycloak_repo" {
  description = "Keycloak Repo PPP"
  type        = string
  default     = "ppp_repo_keycloak"
}
