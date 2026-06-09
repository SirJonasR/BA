variable "account_id" {
  description = "ID of AWS Account"
  type        = string
  default     = "123456789"
}

variable "project" {
  description = "AWS Project Name"
  type        = string
  default     = "shared"
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

variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.1.0.0/16"
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
