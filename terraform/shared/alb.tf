###########################################################
# ALB Module Configuration
###########################################################
module "alb" {
  count = var.environment == "dev" ? 1 : 0

  source = "../modules/alb"

  project     = var.project
  environment = var.environment
  region      = var.region

  vpc_id          = module.vpc[0].vpc.id
  subnets_public  = module.vpc[0].public_subnets[*].id
  subnets_private = module.vpc[0].private_subnets[*].id

}

###########################################################
# All Outputs of the Module
###########################################################
output "alb" {
  description = "All outputs from the alb module"
  value       = var.environment == "dev" ? { for k, v in module.alb[0] : k => v } : null
}

