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

variable "klayers_boto3_package" {
  description = "Klayers package for boto3"
}

variable "sns_budget_alert_topic" {
  description = "SNS topic for budget alerts"
}

variable "ecs_cluster" {
  description = "The ECS cluster to control"
}

variable "service_names" {
  description = "Comma seperated list of ECS service names to control"
  type        = string
}
