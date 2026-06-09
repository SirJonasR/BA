###########################################################
# VPC Module Configuration
###########################################################
module "vpc" {
  count = var.environment == "dev" ? 1 : 0

  source = "../modules/vpc"

  project     = var.project
  environment = var.environment
  region      = var.region

  cidr_block = var.vpc_cidr
  vpc_name   = "${var.project}-${var.environment}-vpc"
}

###########################################################
# All Outputs of the Module
###########################################################
output "vpc" {
  description = "All outputs from the VPC module"
  value       = var.environment == "dev" ? { for k, v in module.vpc[0] : k => v } : null
}
