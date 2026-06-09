variable "project" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (prod/dev)"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "domain_name" {
  description = "The domain name used for the Keycloak Auth Server URL"
  type        = string
}

variable "kc_db_jdbc_url" {
  description = "Keycloak database JDBC URL"
  type        = string
}

variable "db_jdbc_url" {
  description = "Database JDBC URL for Quarkus"
  type        = string
}

variable "keycloak_admin_username" {
  description = "Keycloak usernameL"
  type        = string
  sensitive = true
}

variable "keycloak_admin_password" {
  description = "Keycloak password"
  type        = string
  sensitive = true
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for ECS tasks"
  type        = list(string)
}

variable "db_credentials_quarkus" {
  description = "Database credentials for Quarkus and Liquibase"
}
variable "db_credentials_keycloak" {
  description = "Database credentials for Keycloak"
}


variable "kc_memory" {
  description = "Keycloak memory"
  type = number
  default        = 1024
}

variable "kc_cpu" {
  description = "Keycloak cpu"
  type = number
  default        = 512
}

variable "fe_memory" {
  description = "Keycloak memory"
  type = number
  default        = 1024
}

variable "fe_cpu" {
  description = "Keycloak cpu"
  type = number
  default        = 512
}

variable "be_memory" {
  description = "Keycloak memory"
  type = number
  default        = 1024
}

variable "be_cpu" {
  description = "Keycloak cpu"
  type = number
  default        = 512
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

variable "assign_ecs_public_ip" {
  description = "Should ECS tasks be assigned a public IP?"
  type = bool
  default = false
}