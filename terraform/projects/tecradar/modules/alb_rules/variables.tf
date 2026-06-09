variable "project" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment for the resources (e.g., dev, prod)"
  type        = string
}

variable "region" {
  description = "AWS region to deploy the VPC in"
  type        = string
  default     = "eu-north-1"
}

variable "domain_name" {
  description = "The domain name used for the Keycloak Auth Server URL"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_alb" {
  description = "The public ALB to use"
}

variable "cert_validation_certificate_atos_arn" {
  description = "ARN of the ACM certificate for domain"
  type        = string
}

variable "shared_alb_https_listener_arn" {
    description = "ARN of the shared ALB HTTPS listener"
    type        = string
  }