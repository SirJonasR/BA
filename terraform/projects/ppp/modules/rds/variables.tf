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

variable "allocated_storage" {
  description = "The allocated storage in gigabytes"
  type        = number
}

variable "instance_class" {
  description = "The instance type of the RDS instance"
  type        = string
}

variable "engine" {
  description = "The database engine to use"
  type        = string
}

variable "engine_version" {
  description = "The version of the database engine"
  type        = string
}

variable "db_name" {
  description = "The name of the database to create"
  type        = string
}

variable "db_name_app" {
  description = "The name of the app database to create"
  type        = string
}

variable "vpc_security_group_ids" {
  description = "A list of VPC security group IDs to associate"
  type        = list(string)
}

variable "vpc_security_group_id" {
  description = "The VPC security group ID"
}

variable "db_subnet_group_names" {
  description = "The name of the DB subnet group"
}

variable "storage_type" {
  description = "The storage type for the RDS instance"
  type        = string
  default     = "gp2"  # General Purpose SSD
}

variable "security_groups_ingress" {
  description = "Security groups which are allowed to talk to rds instance"
}

variable "vpc_id" {
  description = "The VPC ID where the RDS instance will be created"
  type        = string
}

variable "skip_final_snapshot" {
  description = "Whether to skip the final snapshot when deleting the RDS instance"
  type        = bool
}

variable "deletion_protection" {
  description = "Whether to enable deletion protection for the RDS instance"
  type        = bool
}

variable "storage_encrypted" {
  description = "Whether to enable storage encryption for the RDS instance"
  type        = bool
}

variable "bastion_host_subnet_id" {
  description = "The subnet ID for the bastion host"
  type        = string
}

variable "restore_private_subnet_ids" {
  description = "List of private subnet IDs for the restore validation Lambda function"
}

###########################################################
# Secrets
###########################################################
variable "db_username" {
  description = "The username for the database"
  type        = string
}

variable "db_password" {
  description = "The password for the database"
  type        = string
  sensitive   = true
}

variable "db_username_admin" {
  description = "The admin username for the database"
  type        = string
}

variable "db_password_admin" {
  description = "The admin password for the database"
  type        = string
  sensitive   = true
}

variable "db_username_root" {
  description = "The root username for the database"
  type        = string
}

variable "db_password_root" {
  description = "The root password for the database"
  type        = string
  sensitive   = true
}

##################################################################
# Dependencies
##################################################################
variable "boto3" {
  description = "Klayers package for boto3"
}

variable "mysql_connector_python" {
  description = "Klayers package for mysql_connector_python"
}
