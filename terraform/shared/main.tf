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

    region  = "eu-north-1"
    encrypt = true

    # tf should lock the .tfstate file, because it is shared and could be used by multiple actors at the same time
    use_lockfile = true
  }
}
