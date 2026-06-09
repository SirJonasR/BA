variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "db_username_root" {
  description = "Database master username"
  type        = string
  default     = "postgres"
}

variable "db_password_root" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
}

variable "max_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for DB subnet group"
  type        = list(string)
}

variable "allowed_security_group_ids" {
  description = "Security group IDs allowed to access the database"
  type        = list(string)
  default     = []
}


variable "storage_type" {
  description = "The storage type for the RDS instance"
  type        = string
  default     = "gp2"  # General Purpose SSD
}

variable "skip_final_snapshot" {
  description = "Whether to skip the final snapshot when deleting the RDS instance"
  type        = bool
  default     = true
}

variable "bastion_host_subnet_id" {
  description = "The subnet ID for the bastion host"
  type        = string
}