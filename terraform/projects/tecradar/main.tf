provider "aws" {
  region     = var.region
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
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  backend "s3" {
    bucket = "ams-projects-terraform-state-bucket"
    region  = "eu-north-1"
    encrypt = true
    use_lockfile = true
  }
}

locals {
  is_prod = var.environment == "prod"
}



###########################################################
# SHARED : Load ALB and VPC
###########################################################
data "terraform_remote_state" "shared_modules" {
  backend = "s3"
  config = {
    bucket = "ams-projects-terraform-state-bucket"
    key    = "shared/${var.environment}/terraform.tfstate"
    region = "eu-north-1"
  }
}
# TODO: For production use, the null values have to be replaced with the values of TecRadar prod VPC and ALB (needs to be created)
locals {
  vpc = {
    id                     = local.is_prod ? module.vpc_prod[0].vpc_id : data.terraform_remote_state.shared_modules.outputs.vpc.vpc.id
    arn                    = local.is_prod ? module.vpc_prod[0].vpc_arn : data.terraform_remote_state.shared_modules.outputs.vpc.vpc.arn
    region                 = var.region
    public_subnet_ids      = local.is_prod ? module.vpc_prod[0].public_subnets : data.terraform_remote_state.shared_modules.outputs.vpc.public_subnets[*].id
    first_public_subnet_id = local.is_prod ? module.vpc_prod[0].public_subnets[0] : data.terraform_remote_state.shared_modules.outputs.vpc.public_subnets[0].id
    private_subnet_ids     = local.is_prod ? module.vpc_prod[0].private_subnets : data.terraform_remote_state.shared_modules.outputs.vpc.private_subnets[*].id
    ecs_cluster_sg         = local.is_prod ? null : data.terraform_remote_state.shared_modules.outputs.vpc.ecs_cluster_sg # Prod hat kein geteiltes SG-Objekt
    ecs_cluster_sg_id      = local.is_prod ? aws_security_group.ecs_tasks_prod[0].id : data.terraform_remote_state.shared_modules.outputs.vpc.ecs_cluster_sg.id
  }
}

locals {
  alb = {
    alb_sg             = local.is_prod ? aws_security_group.alb_prod_sg[0] : data.terraform_remote_state.shared_modules.outputs.alb.alb_sg
    alb_private        = local.is_prod ? null : data.terraform_remote_state.shared_modules.outputs.alb.alb_private
    alb_public         = local.is_prod ? aws_lb.alb_prod[0] : data.terraform_remote_state.shared_modules.outputs.alb.alb_public
    public_dns_name    = local.is_prod ? aws_lb.alb_prod[0].dns_name : data.terraform_remote_state.shared_modules.outputs.alb.alb_public.dns_name
    private_dns_name   = local.is_prod ? null : data.terraform_remote_state.shared_modules.outputs.alb.alb_private.dns_name
    # aws_lb_listener.https_prod[0].arn
    https_listener_arn = local.is_prod ? aws_lb_listener.https_prod[0].arn : "arn:aws:elasticloadbalancing:eu-north-1:897729117054:listener/app/shared-dev-public-alb/ea754ac6893f19fd/fc25426775924f0f"
  }
}


###########################################################
# PROD: Dedicated VPC & Endpoints
###########################################################
module "vpc_prod" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  count   = local.is_prod ? 1 : 0

  name = "${var.project}-${var.environment}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = false # Da wir VPC Endpoints nutzen, sparen wir uns das NAT Gateway
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_security_group" "vpc_endpoints_sg" {
  count       = local.is_prod ? 1 : 0
  name        = "${var.project}-${var.environment}-vpc-endpoints-sg"
  description = "Security Group for VPC Endpoints"
  vpc_id      = module.vpc_prod[0].vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [module.vpc_prod[0].vpc_cidr_block]
  }
}

module "vpc_endpoints_prod" {
  source  = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
  version = "~> 5.0"
  count   = local.is_prod ? 1 : 0

  vpc_id             = module.vpc_prod[0].vpc_id
  security_group_ids = [aws_security_group.vpc_endpoints_sg[0].id]

  endpoints = {
    tecradar-prod-s3-endpoint = {
      service       = "s3"
      service_type = "Gateway"
      route_table_ids = module.vpc_prod[0].private_route_table_ids
    },
    tecradar-prod-ecr-api-endpoint = {
      service             = "ecr.api"
      private_dns_enabled = true
      subnet_ids          = module.vpc_prod[0].private_subnets
    },
    tecradar-prod-ecr-dkr-endpoint = {
      service             = "ecr.dkr"
      private_dns_enabled = true
      subnet_ids          = module.vpc_prod[0].private_subnets
    },
    tecradar-prod-logs-endpoint = {
      service             = "logs"
      private_dns_enabled = true
      subnet_ids          = module.vpc_prod[0].private_subnets
    },
    tecradar-prod-secretsmanager-endpoint = {
      service             = "secretsmanager"
      private_dns_enabled = true
      subnet_ids          = module.vpc_prod[0].private_subnets
    }
  }
}

resource "aws_security_group" "ecs_tasks_prod" {
  count       = local.is_prod ? 1 : 0
  name        = "${var.project}-${var.environment}-ecs-tasks-sg"
  description = "Security Group for ECS Tasks (Prod)"
  vpc_id      = module.vpc_prod[0].vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.alb_prod_sg[0].id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

###########################################################
# PROD: Dedicated ALB & Listeners
###########################################################
resource "aws_security_group" "alb_prod_sg" {
  count       = local.is_prod ? 1 : 0
  name        = "${var.project}-${var.environment}-alb-sg"
  vpc_id      = module.vpc_prod[0].vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "alb_prod" {
  count              = local.is_prod ? 1 : 0
  name               = "${var.project}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_prod_sg[0].id]
  subnets            = module.vpc_prod[0].public_subnets
}

# Weiterleitung von HTTP auf HTTPS
resource "aws_lb_listener" "http_to_https_prod" {
  count             = local.is_prod ? 1 : 0
  load_balancer_arn = aws_lb.alb_prod[0].arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTPS Listener (Default 404, echte Regeln kommen aus module.alb_rules)

resource "aws_lb_listener" "https_prod" {
  count             = local.is_prod ? 1 : 0
  load_balancer_arn = aws_lb.alb_prod[0].arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.tecradar_subdomain_cert.arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# =======================================
# ALB und SSL

# ACM Zertifikat
# Falls ein neues Zertifikat benötigt wird, einfach auskommentieren.
/*resource "aws_acm_certificate" "tecradar_subdomain_cert" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  region       = var.region

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Environment = var.environment
    Project     = var.project
  }
}*/

# Bestehendes Zertifikat abfragen
data "aws_acm_certificate" "tecradar_subdomain_cert" {
  domain   = var.domain_name
  statuses = ["ISSUED"] # Sucht nur nach fertig ausgestellten Zertifikaten
}

###########################################################
# ALB_Rules Module Configuration
###########################################################

module "alb_rules" {
  source = "./modules/alb_rules"
  project     = var.project
  environment = var.environment
  region      = var.region
  public_alb  = local.alb.alb_public
  vpc_id                                   = local.vpc.id
  cert_validation_certificate_atos_arn = data.aws_acm_certificate.tecradar_subdomain_cert.arn
  shared_alb_https_listener_arn = local.alb.https_listener_arn
  domain_name = var.domain_name
}


# ==============================
# DATABASE
module "rds" {
  source = "./modules/rds"

  project = var.project
  environment     = var.environment

  db_username_root = var.db_username_root
  db_password_root = random_password.db_root_password.result

  vpc_id                     = local.vpc.id
  subnet_ids                 = local.vpc.private_subnet_ids
  allowed_security_group_ids = [local.vpc.ecs_cluster_sg_id]
  allocated_storage = 5
  max_allocated_storage = 20
  bastion_host_subnet_id = local.vpc.first_public_subnet_id
}

# ============================
# ECS (Elastic Container Service)
module "backend" {
  source = "./modules/backend"
  project = var.project
  environment     = var.environment
  region       = var.region
  db_jdbc_url = "${module.rds.jdbc_url}/quarkus?sslmode=require"
  kc_db_jdbc_url = "${module.rds.jdbc_url}/keycloak?sslmode=require"
  keycloak_admin_password = random_password.keycloak_admin_password.result
  keycloak_admin_username = var.keycloak_admin_username
  ecs_security_group_id = local.vpc.ecs_cluster_sg_id
  subnet_ids = local.vpc.private_subnet_ids
  db_credentials_quarkus = module.rds.db_credentials_quarkus
  db_credentials_keycloak = module.rds.db_credentials_keycloak
  keycloak_ecs_target_group = module.alb_rules.keycloak_ecs_target_group
  backend_ecs_target_group  = module.alb_rules.backend_ecs_target_group
  frontend_ecs_target_group = module.alb_rules.frontend_ecs_target_group
  assign_ecs_public_ip = false
  domain_name = var.domain_name
}

resource "random_password" "keycloak_admin_password" {
  length  = 32
  special = true

  lifecycle {
    ignore_changes = all
  }
}

resource "random_password" "db_root_password" {
  length  = 32
  special = true

  override_special = "!#$%&*()-_=+[]{}<>:?"

  lifecycle {
    ignore_changes = all
  }
}