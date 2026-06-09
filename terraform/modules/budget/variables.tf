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

variable "cost_limit" {
  description = "Monthly cost limit for the budget in USD"
  type        = number
}

variable "cost_notification_emails" {
  description = "List of email addresses to notify when budget thresholds are exceeded"
  type        = list(string)
}
