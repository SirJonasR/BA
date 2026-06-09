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

variable "vpc_name" {
  description = "The name of the VPC including the environment"
  type        = string
}

variable "cidr_block" {
  description = "The CIDR block for the VPC"
  type        = string
  default = "10.1.0.0/16"
}

variable "az_count" {
  description = "Number of Availability Zones to use for the VPC"
  type        = number
  default     = 2
}
