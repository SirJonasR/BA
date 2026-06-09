variable "tld" {
  description = "Top-level domain"
  type        = string
  default     = "3p-ams.de"
}

variable "environment" {
  description = "Environment (prod, dev, staging, etc.)"
  type        = string
}

variable "project" {
  description = "Project name for tagging"
  type        = string
}

variable "alb_public" {
  description = "Public ALB object with dns_name and zone_id"
  type = object({
    dns_name = string
    zone_id  = string
  })
}