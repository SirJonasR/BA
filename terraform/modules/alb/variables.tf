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

variable "vpc_id" {
  description = "VPC ID where the ALB will be created"
  type        = string
}

variable "subnets_public" {
  description = "List of Subnet IDs for the ALB"
  type        = list(string)
}

variable "subnets_private" {
  description = "List of Subnet IDs for the ALB"
  type        = list(string)
}
