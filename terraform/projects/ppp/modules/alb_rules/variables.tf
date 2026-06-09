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

variable "tld" {
  description = "Top-Level Domain for the project"
  type        = string
}

variable "frontend_cert_validation_certificate_arn" {
  description = "ARN of the ACM certificate for the frontend subdomain"
  type        = string
}

variable "keycloak_cert_validation_certificate_arn" {
  description = "ARN of the ACM certificate for the keycloak subdomain"
  type        = string
}

variable "public_alb" {
  description = "The public ALB"
}

variable "private_alb" {
  description = "The private ALB"
}
