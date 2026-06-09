provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key

  assume_role {
    role_arn = "arn:aws:iam::${var.account_id}:role/pppTerraformAdministrator"
  }

  default_tags {
    tags = {
      Project = var.project
    }
  }
}

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }

  backend "s3" {
    bucket       = "ppp-setup-terraform-state-bucket"
    region       = "eu-north-1"
    encrypt      = true
    use_lockfile = true
  }
}

###########################################################
# ecr_repo Module Configuration
###########################################################
module "ecr_repo" {
  source = "./modules/ecr_repo"

  project = var.project
  region  = var.region

  ppp_backend_repo  = var.ppp_backend_repo
  ppp_keycloak_repo = var.ppp_keycloak_repo
  ppp_frontend_repo = var.ppp_frontend_repo
}

###########################################################
# Terraform Admin Module Configuration
###########################################################
module "terraform_admin" {
  source = "./modules/terraform_admin"

  project = var.project
  region  = var.region

  username = "TerraformAdministratorPPP"
}

output "tf_access_key_id" {
  value     = module.terraform_admin.terraform_admin_access_key_id
  sensitive = true
}

output "tf_secret_access_key" {
  value     = module.terraform_admin.terraform_admin_secret_access_key
  sensitive = true
}
