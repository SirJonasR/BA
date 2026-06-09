variable "project" {
  description = "Name of the project"
  type        = string
  default     = "aws_terraform_learning"
}

variable "region" {
  description = "AWS region to deploy the VPC in"
  type        = string
  default     = "eu-north-1"
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
