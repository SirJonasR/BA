# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project}-${var.environment}-cluster"

  tags = {
    Name        = "${var.project}-${var.environment}-ecs-cluster"
    Environment = var.environment
    Project     = var.project
  }
}

# IAM role for ECS task execution
resource "aws_iam_role" "ecs_task_execution" {
  name = "${var.project}-${var.environment}-ecs-task-execution-role"
  tags = {
    Name        = "${var.project}-${var.environment}-ecs-cluster"
    Environment = var.environment
    Project     = var.project
  }
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attach the ECS task execution policy
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECR pull permissions policy
resource "aws_iam_policy" "ecr_pull_policy" {
  name        = "${var.project}-${var.environment}-ecr-pull-policy"
  description = "Policy to allow ECS task execution role to pull images from ECR"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-ecr-pull-policy"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_ecr" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecr_pull_policy.arn
}

# IAM role for ECS task (application role)
resource "aws_iam_role" "ecs_task" {
  name = "${var.project}-${var.environment}-ecs-task-role"
  tags = {
    Name        = "${var.project}-${var.environment}-ecs-cluster"
    Environment = var.environment
    Project     = var.project
  }

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}


resource "aws_iam_policy" "secrets_manager_policy" {
  name        = "${var.project}-${var.environment}-secrets-manager-policy"
  description = "Policy to allow ECS task execution role to access Secrets Manager secrets"
  policy = jsonencode({
    Version = "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        "Resource" : [
          var.db_credentials_keycloak.arn,
          var.db_credentials_quarkus.arn,
          aws_secretsmanager_secret.keycloak_admin.arn,
        ]
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-secrets-manager-policy"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.secrets_manager_policy.arn
}