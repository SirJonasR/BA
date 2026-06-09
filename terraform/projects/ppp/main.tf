provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key

  assume_role {
    role_arn = "arn:aws:iam::${var.account_id}:role/pppTerraformAdministrator"
  }

  default_tags {
    tags = {
      Project     = var.project
      Environment = var.environment
    }
  }

}

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
    # This is a custom provider for managing AWS Lambda layers
    # https://github.com/keithrozario/Klayers
    klayers = {
      version = "~> 1.0.0"
      source  = "ldcorentin/klayer"
    }
  }

  # Use S3 Bucket (preferably with enabled versioning) to store the .tfstate file
  backend "s3" {
    bucket = "ams-projects-terraform-state-bucket"
    # key     = "state/terraform.tfstate"  # This gets provided to the init command by a param, because it differs between dev/prod and variables are not allowed here
    region  = "eu-north-1"
    encrypt = true
    # tf should lock the .tfstate file, because it is shared and could be used by multiple pipelines at the same time
    use_lockfile = true
  }

}

data "terraform_remote_state" "shared_modules" {
  backend = "s3"
  config = {
    bucket = "ams-projects-terraform-state-bucket"
    key    = "shared/${var.environment}/terraform.tfstate"
    region = "eu-north-1"
  }
}

###########################################################
# VPC Module Configuration
###########################################################
# Prod Environment uses a direct instance of the VPC module
# Dev Environment uses a remote state to get the shared VPC module outputs
module "vpc" {
  count = local.is_prod ? 1 : 0

  source = "../../modules/vpc"

  project     = var.project
  environment = var.environment
  region      = var.region

  cidr_block = var.vpc_cidr
  vpc_name   = "${var.project}-${var.environment}-vpc"

}

locals {
  vpc = {
    vpc_id                 = local.is_prod ? module.vpc[0].vpc.id : data.terraform_remote_state.shared_modules.outputs.vpc.vpc.id
    db_subnet_group_names  = local.is_prod ? module.vpc[0].db_subnet_group_names : data.terraform_remote_state.shared_modules.outputs.vpc.db_subnet_group_names
    ecs_cluster_sg         = local.is_prod ? module.vpc[0].ecs_cluster_sg : data.terraform_remote_state.shared_modules.outputs.vpc.ecs_cluster_sg
    ecs_cluster_sg_id      = local.is_prod ? module.vpc[0].ecs_cluster_sg.id : data.terraform_remote_state.shared_modules.outputs.vpc.ecs_cluster_sg.id
    first_public_subnet_id = local.is_prod ? module.vpc[0].public_subnets[0].id : data.terraform_remote_state.shared_modules.outputs.vpc.public_subnets[0].id
    private_subnet_ids     = local.is_prod ? module.vpc[0].private_subnets[*].id : data.terraform_remote_state.shared_modules.outputs.vpc.private_subnets[*].id
    public_subnet_ids      = local.is_prod ? module.vpc[0].public_subnets[*].id : data.terraform_remote_state.shared_modules.outputs.vpc.public_subnets[*].id
    private_subnets        = local.is_prod ? module.vpc[0].private_subnets : data.terraform_remote_state.shared_modules.outputs.vpc.private_subnets
  }
}


###########################################################
# RDS Module Configuration
###########################################################
module "rds" {
  source = "./modules/rds"

  project     = var.project
  environment = var.environment
  region      = var.region

  db_name                = var.db_name
  db_name_app            = var.db_name_app
  vpc_id                 = local.vpc.vpc_id
  db_subnet_group_names  = local.vpc.db_subnet_group_names
  vpc_security_group_ids = [local.vpc.ecs_cluster_sg_id]
  vpc_security_group_id  = local.vpc.ecs_cluster_sg_id
  allocated_storage      = var.allocated_storage
  storage_type           = var.storage_type
  engine                 = var.engine
  engine_version         = var.engine_version
  instance_class         = var.instance_class
  deletion_protection    = var.deletion_protection
  skip_final_snapshot    = var.skip_final_snapshot
  storage_encrypted      = var.storage_encrypted

  security_groups_ingress = [local.vpc.ecs_cluster_sg_id]

  bastion_host_subnet_id = local.vpc.first_public_subnet_id

  db_username = var.db_username
  db_password = var.db_password

  db_username_admin = var.db_username_admin
  db_password_admin = var.db_password_admin

  db_username_root = var.db_username_root
  db_password_root = var.db_password_root

  restore_private_subnet_ids = local.vpc.private_subnet_ids

  boto3                  = data.klayers_package_latest_version.boto3
  mysql_connector_python = data.klayers_package_latest_version.mysql_connector_python

}

###########################################################
# ALB Module Configuration
###########################################################
module "alb" {
  count = local.is_prod ? 1 : 0

  source = "../../modules/alb"

  project     = var.project
  environment = var.environment
  region      = var.region

  vpc_id          = local.vpc.vpc_id
  subnets_public  = local.vpc.public_subnet_ids
  subnets_private = local.vpc.private_subnet_ids

}

locals {
  alb = {
    alb_sg           = local.is_prod ? module.alb[0].alb_sg : data.terraform_remote_state.shared_modules.outputs.alb.alb_sg
    alb_private      = local.is_prod ? module.alb[0].alb_private : data.terraform_remote_state.shared_modules.outputs.alb.alb_private
    alb_public       = local.is_prod ? module.alb[0].alb_public : data.terraform_remote_state.shared_modules.outputs.alb.alb_public
    public_dns_name  = local.is_prod ? module.alb[0].alb_public.dns_name : data.terraform_remote_state.shared_modules.outputs.alb.alb_public.dns_name
    private_dns_name = local.is_prod ? module.alb[0].alb_private.dns_name : data.terraform_remote_state.shared_modules.outputs.alb.alb_private.dns_name
  }
}

###########################################################
# ALB_Rules Module Configuration
###########################################################
module "alb_rules" {
  source = "./modules/alb_rules"

  project     = var.project
  environment = var.environment
  region      = var.region

  private_alb = local.alb.alb_private
  public_alb  = local.alb.alb_public

  vpc_id                                   = local.vpc.vpc_id
  tld                                      = var.tld
  frontend_cert_validation_certificate_arn = module.route53.frontend_cert_validation_certificate_arn
  keycloak_cert_validation_certificate_arn = module.route53.keycloak_cert_validation_certificate_arn

}

###########################################################
# WAF v2 Module Configuration
###########################################################
module "waf_v2" {
  source = "./modules/waf_v2"

  project     = var.project
  environment = var.environment
  region      = var.region

  public_alb = local.alb.alb_public
}

###########################################################
# Route53 Module Configuration
###########################################################
module "route53" {
  source = "./modules/route53"

  project     = var.project
  environment = var.environment
  region      = var.region

  tld        = var.tld
  alb_public = local.alb.alb_public

}

###########################################################
# ECS Module Configuration
###########################################################
module "ecs" {
  source = "./modules/ecs"

  project     = var.project
  environment = var.environment
  region      = var.region

  account_id    = var.account_id
  keycloak_repo = var.keycloak_repo
  backend_repo  = var.backend_repo
  frontend_repo = var.frontend_repo

  # How many instances each of frontend, backend, keycloak should be run at day/night time at minimum and maximum
  timezone                 = var.timezone
  start_day_time           = var.start_day_time
  scaling_target_day_min   = var.scaling_target_day_min
  scaling_target_day_max   = var.scaling_target_day_max
  start_night_time         = var.start_night_time
  scaling_target_night_min = var.scaling_target_night_min
  scaling_target_night_max = var.scaling_target_night_max

  private_subnets           = local.vpc.private_subnets
  alb_private               = local.alb.alb_private
  ecs_cluster_sg            = local.vpc.ecs_cluster_sg
  keycloak_ecs_target_group = module.alb_rules.keycloak_ecs_target_group
  backend_ecs_target_group  = module.alb_rules.backend_ecs_target_group
  frontend_ecs_target_group = module.alb_rules.frontend_ecs_target_group

  db_name     = var.db_name
  db_name_app = var.db_name_app
  tld         = var.tld

  db_endpoint          = var.environment == "dev" ? module.rds.aws_db_instance_mysql_endpoint : module.rds.aws_db_aurora_cluster_endpoint
  db_credentials_root  = module.rds.db_credentials_root
  db_credentials_admin = module.rds.db_credentials_admin
  db_credentials       = module.rds.db_credentials

  next_auth_secret = var.next_auth_secret
  smtp_password    = var.smtp_password
  smtp_username    = var.smtp_username

  ####################
  # Keycloak
  ####################
  keycloak_admin_username = var.keycloak_admin_username
  kc_memory               = var.kc_memory
  kc_cpu                  = var.kc_cpu

  realm_name = var.realm_name
  smtp_host  = var.smtp_host
  smtp_port  = var.smtp_port
  smtp_from  = var.smtp_from

  keycloak_secret         = var.keycloak_secret
  keycloak_admin_password = var.keycloak_admin_password
  keycloak_subdomain_zone = module.route53.keycloak_subdomain_zone

  ####################
  # Frontend
  ####################
  fe_memory = var.fe_memory
  fe_cpu    = var.fe_cpu

  ####################
  # Backend
  ####################
  be_memory = var.be_memory
  be_cpu    = var.be_cpu

}

###########################################################
# Budget Module Configuration
###########################################################
module "budget" {
  source = "../../modules/budget"

  project     = var.project
  environment = var.environment
  region      = var.region

  cost_limit               = var.cost_limit
  cost_notification_emails = var.cost_notification_emails

}

###########################################################
# Budget Control Module Configuration
###########################################################
module "budget_control" {
  source                = "./modules/budget_control"
  klayers_boto3_package = data.klayers_package_latest_version.boto3

  project     = var.project
  environment = var.environment
  region      = var.region

  sns_budget_alert_topic = module.budget.sns_budget_alert_topic
  ecs_cluster            = module.ecs.cluster
  service_names          = "${module.ecs.frontend_service.name},${module.ecs.backend_service.name},${module.ecs.keycloak_service.name}"

}
