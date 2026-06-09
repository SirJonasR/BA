resource "aws_iam_role" "ecsTaskExecutionRole" {
  name               = "${var.project}-${var.environment}-execution-task-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json

  tags = {
    Name        = "${var.project}-${var.environment}-iam-ecsTaskExecutionRole-role"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_policy" "ecr_pullthroughcache_policy" {
  name        = "${var.project}-${var.environment}-ecr-pullthrough-policy"
  description = "Policy to allow ECS task execution role to interact with ECR pull-through cache"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:DescribeImages"
        ],
        Resource = "arn:aws:ecr:${var.region}:${data.aws_caller_identity.current.account_id}:${var.project}-${var.environment}-quay/keycloak"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-ecr-pullthrough-policy"
    Project     = var.project
    Environment = var.environment
  }
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
          var.db_credentials.arn,
          var.db_credentials_admin.arn,
          var.db_credentials_root.arn,
          aws_secretsmanager_secret.keycloak_admin.arn,
          aws_secretsmanager_secret.next_auth.arn,
          aws_secretsmanager_secret.keycloak_secret.arn,
          aws_secretsmanager_secret.smtp_credentials.arn
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

resource "aws_iam_policy" "cloud_shell_policy" {
  name        = "${var.project}-${var.environment}-cloud-shell-policy"
  description = "Allow to attach with cloud shell exec"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ],
        "Resource" : "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-cloud-shell-policy"
    Project     = var.project
    Environment = var.environment
  }
}


resource "aws_iam_role" "appAutoscalingRole" {
  name = "${var.project}-${var.environment}-appAutoscalingRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "application-autoscaling.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      },
    ]
  })
}

resource "aws_iam_role_policy" "app_autoscaling_policy" {
  name = "${var.project}-${var.environment}-app-autoscaling-policy"
  role = aws_iam_role.appAutoscalingRole.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "cloudwatch:DescribeAlarms",
          "cloudwatch:GetMetricData",
          "cloudwatch:PutMetricAlarm",
          "cloudwatch:DeleteAlarms"
        ]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionPolicy_AmazonEC2ContainerServiceforEC2Role" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionPolicy_AmazonECSTaskExecutionRolePolicy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionPolicy_CloudShellPolicy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = aws_iam_policy.cloud_shell_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionPolicy_AWSServiceRoleForECRPullThroughCache" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = aws_iam_policy.ecr_pullthroughcache_policy.arn
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionPolicy_AWSServiceRoleForSecretManager" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = aws_iam_policy.secrets_manager_policy.arn
}
