data "aws_ecs_task_definition" "keycloak_current" {
  task_definition = "ppp-${var.environment == "prod" ? "prod" : "dev"}-keycloak-task"

  depends_on = [aws_ecs_task_definition.keycloak_ecs_task]
}

data "aws_ecs_task_definition" "backend_current" {
  task_definition = "ppp-${var.environment == "prod" ? "prod" : "dev"}-backend-task"

  depends_on = [aws_ecs_task_definition.backend_ecs_task]
}

data "aws_ecs_task_definition" "frontend_current" {
  task_definition = "ppp-${var.environment == "prod" ? "prod" : "dev"}-frontend-task"

  depends_on = [aws_ecs_task_definition.frontend_ecs_task]
}

data "aws_ssm_parameter" "be_image_tag" {
  count = var.environment == "prod" ? 1 : 0
  name  = "backend_ppp_prod_tag"
  region = var.region
}

data "aws_ssm_parameter" "fe_image_tag" {
  count = var.environment == "prod" ? 1 : 0
  name  = "frontend_ppp_prod_tag"
  region = var.region
}

data "aws_ssm_parameter" "kc_image_tag" {
  count = var.environment == "prod" ? 1 : 0
  name  = "keycloak_ppp_prod_tag"
  region = var.region
}

locals {
  be_image_tag = var.environment == "prod" ? data.aws_ssm_parameter.be_image_tag[0].value : "latest"
  fe_image_tag = var.environment == "prod" ? data.aws_ssm_parameter.fe_image_tag[0].value : "latest"
  kc_image_tag = var.environment == "prod" ? data.aws_ssm_parameter.kc_image_tag[0].value : "latest"
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_caller_identity" "current" {}
