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

variable "tld" {
  description = "domain name"
  type        = string
  default     = "3p-ams.de"
}

variable "environment" {
  description = "Define the environment (dev/prod)"
  type        = string
  default     = "development"
}

variable "region" {
  description = "The region to create resources."
  type        = string
  default     = "eu-north-1"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.1.0.0/16"
}

variable "db_name" {
  description = "Name of db for keycloak"
  type        = string
}

variable "db_name_app" {
  description = "Name of db for backend"
  type        = string
}

variable "db_username" {
  description = "The username for the database."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The password for the database."
  type        = string
  sensitive   = true
}

variable "db_username_admin" {
  description = "The admin username for the database."
  type        = string
  sensitive   = true
}

variable "db_password_admin" {
  description = "The admin password for the database."
  type        = string
  sensitive   = true
}

variable "db_username_root" {
  description = "The root username for the database."
  type        = string
  sensitive   = true
}

variable "db_password_root" {
  description = "The root password for the database."
  type        = string
  sensitive   = true
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

variable "kc_memory" {
  description = "Amount of memory"
  type        = number
  default     = 512
}

variable "kc_cpu" {
  description = "Amount of cpu"
  type        = number
  default     = 256
}

variable "fe_memory" {
  description = "Amount of memory"
  type        = number
  default     = 512
}

variable "fe_cpu" {
  description = "Amount of cpu"
  type        = number
  default     = 256
}

variable "be_memory" {
  description = "Amount of memory"
  type        = number
  default     = 512
}

variable "be_cpu" {
  description = "Amount of cpu"
  type        = number
  default     = 256
}

variable "scaling_target_day_min" {
  description = "No of instances during day time min"
  type        = number
  default     = 1
}

variable "scaling_target_day_max" {
  description = "No of instances during day time max"
  type        = number
  default     = 1
}

variable "timezone" {
  description = "Timezone used for auto scaling. Possible values: https://www.joda.org/joda-time/timezones.html"
  type        = string
  default     = "Europe/Berlin"
}

variable "start_day_time" {
  description = "cron expression for start of day time"
  type        = string
  default     = "cron(0 6 * * ? *)" # 6 am
}

variable "scaling_target_night_min" {
  description = "No of instances during night time min"
  type        = number
  default     = 1
}

variable "scaling_target_night_max" {
  description = "No of instances during night time max"
  type        = number
  default     = 1
}

variable "start_night_time" {
  description = "cron expression for start of night time"
  type        = string
  default     = "cron(0 22 * * ? *)" # 10 pm
}

variable "cost_limit" {
  description = "Maximum cost per month"
  type        = string
  default     = "300"
}

variable "cost_notification_emails" {
  description = "List of mails receiving alerts about cost"
  type        = list(string)
  default     = []
}

variable "backend_repo" {
  description = "Backend Repo"
  type        = string
  default     = "ppp_repo_backend"
}

variable "frontend_repo" {
  description = "Frontend Repo"
  type        = string
  default     = "ppp_repo_frontend"
}

variable "keycloak_repo" {
  description = "Keycloak Repo"
  type        = string
  default     = "ppp_repo_keycloak"
}

variable "engine" {
  description = "The database engine"
  type        = string
  default     = "mysql"
}

variable "engine_version" {
  description = "The version of the database engine"
  type        = string
  default     = "8.0"
}

variable "instance_class" {
  description = "The instance class for the database"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "The allocated storage for the database in GB"
  type        = number
  default     = 20
}

variable "skip_final_snapshot" {
  description = "Whether to skip the final snapshot before deletion"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Whether to enable deletion protection for the database"
  type        = bool
  default     = true
}

variable "storage_encrypted" {
  description = "Whether to enable encryption for the database"
  type        = bool
  default     = true
}

variable "storage_type" {
  description = "Storage type for the database"
  type        = string
  default     = "gp3"
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

variable "realm_name" {
  description = "The realm name for keycloak."
  type        = string
  default     = "ppp-sandbox"
}

variable "smtp_host" {
  description = "The address of the smtp server."
  type        = string
  default     = "email-smtp.eu-north-1.amazonaws.com"
}

variable "smtp_port" {
  description = "The port of the smtp server."
  type        = string
  default     = "465"
}

variable "smtp_from" {
  description = "The sender mail address to send mails from."
  type        = string
  default     = "noreply@3p-ams.de"
}
