variable "project" {
  description = "Name of the project"
  type        = string
  default     = "aws_terraform_learning"
}

variable "environment" {
  description = "Environment for the resources (e.g., dev, staging, prod)"
  type        = string
}

variable "region" {
  description = "AWS region to deploy the VPC in"
  type        = string
  default     = "eu-north-1"
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs for the ECS cluster"
}

variable "kc_memory" {
  description = "Memory allocation for Keycloak"
  type        = number
  default     = 1024
}

variable "kc_cpu" {
  description = "CPU allocation for Keycloak"
  type        = number
  default     = 256
}

variable "realm_name" {
  description = "Realm name for Keycloak"
  type        = string
  default     = "ppp-sandbox"
}

variable "smtp_host" {
  description = "SMTP host for Keycloak"
  type        = string
  default     = "email-smtp.eu-north-1.amazonaws.com"
}

variable "smtp_port" {
  description = "SMTP port for Keycloak"
  type        = string
  default     = "465"
}

variable "smtp_from" {
  description = "SMTP from address for Keycloak"
  type        = string
  default     = "noreply@3p-ams.de"
}

variable "fe_memory" {
  description = "Memory allocation for the frontend"
  type        = number
  default     = 512
}

variable "fe_cpu" {
  description = "CPU allocation for the frontend"
  type        = number
  default     = 256
}

variable "be_memory" {
  description = "Memory allocation for the backend"
  type        = number
  default     = 512
}

variable "be_cpu" {
  description = "CPU allocation for the backend"
  type        = number
  default     = 256
}

variable "ecs_cluster_sg" {
  description = "Security group for the ECS cluster"
}

variable "keycloak_ecs_target_group" {
  description = "Target group for Keycloak ECS service"
}

variable "frontend_ecs_target_group" {
  description = "Target group for Frontend ECS service"
}

variable "backend_ecs_target_group" {
  description = "Target group for Backend ECS service"
}

variable "keycloak_repo" {
  description = "ECR repository for Keycloak Docker image"
  type        = string
}

variable "backend_repo" {
  description = "ECR repository for Backend Docker image"
  type        = string
}

variable "frontend_repo" {
  description = "ECR repository for Frontend Docker image"
  type        = string
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_name_app" {
  description = "Name of the app database"
  type        = string
}

variable "tld" {
  description = "Top-level domain for the application"
  type        = string
}

variable "timezone" {
  description = "Timezone for the application"
  type        = string
}

variable "start_day_time" {
  description = "Cron expression for the start of the day"
  type        = string
}

variable "scaling_target_day_min" {
  description = "Minimum scaling target during the day"
  type        = number
}

variable "scaling_target_day_max" {
  description = "Maximum scaling target during the day"
  type        = number
}

variable "start_night_time" {
  description = "Cron expression for the start of the night"
  type        = string
}

variable "scaling_target_night_min" {
  description = "Minimum scaling target during the night"
  type        = number
}

variable "scaling_target_night_max" {
  description = "Maximum scaling target during the night"
  type        = number
}

variable "db_endpoint" {
  description = "Endpoint of the RDS database"
  type        = string
}

variable "db_credentials_root" {
  description = "Database credentials for root access"
}

variable "db_credentials_admin" {
  description = "Database credentials for admin access"
}

variable "db_credentials" {
  description = "Database credentials"
}

variable "keycloak_admin_username" {
  description = "The username for the keycloak admin."
  type        = string
  sensitive   = true
}

variable "keycloak_admin_password" {
  description = "The password for the keycloak admin."
  type        = string
  sensitive   = true
}

variable "next_auth_secret" {
  description = "The next auth secret."
  type        = string
  sensitive   = true
}

variable "keycloak_secret" {
  description = "The keycloak client secret"
  type        = string
  sensitive   = true
}

variable "keycloak_subdomain_zone" {
  description = "The subdomain zone for Keycloak"
}

variable "alb_private" {
  description = "Private ALB to get dns name from"
}

variable "smtp_username" {
  description = "The username for the smtp server."
  type        = string
  sensitive   = true
}

variable "smtp_password" {
  description = "The password for the smtp server."
  type        = string
  sensitive   = true
}
