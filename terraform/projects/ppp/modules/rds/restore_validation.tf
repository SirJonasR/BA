# Policy for lambda restore validation
resource "aws_iam_policy" "lambda_restore_validation_policy" {
  name = "${var.project}-${var.environment}-lambda-restore-validation-policy"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBClusters",
          "rds:CreateDBInstance",
          "rds:AddTagsToResource",
          "rds:DeleteDBInstance"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "backup:PutRestoreValidationResult"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "lambda:InvokeFunction"
        ],
        Resource = "arn:aws:lambda:eu-north-1:897729117054:function:ppp-prod-restore-validation"
      }
    ]
  })
}

# Attach the policy to the Lambda execution role, which is defined in the budget.tf file
resource "aws_iam_role_policy_attachment" "lambda_restore_validation_attach" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_restore_validation_policy.arn
}

# Zip the lambda function source code
data "archive_file" "lambda_zip_restore_validation" {
  type        = "zip"
  source_file = "${path.module}/lambda/lambda_restore_validation.py"
  output_path = "./lambda_restore_validation.zip"
}

resource "aws_lambda_function" "restore_validation" {
  filename         = data.archive_file.lambda_zip_restore_validation.output_path
  function_name    = "${var.project}-${var.environment}-restore-validation"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "lambda_restore_validation.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.lambda_zip_restore_validation.output_base64sha256
  timeout          = 30

  layers = [
    var.boto3.arn,
    var.mysql_connector_python.arn
  ]

  environment {
    variables = {
      DB_HOST    = ""
      DB_PORT    = "3306"
      DB_NAME    = var.db_name_app
      SECRET_ARN = aws_secretsmanager_secret.db_credentials_admin.arn
    }
  }

  vpc_config {
    subnet_ids         = var.restore_private_subnet_ids
    security_group_ids = [aws_security_group.rds_sg.id, var.vpc_security_group_id]
  }

}

resource "aws_cloudwatch_log_group" "lambda_restore_validation" {
  name              = "/aws/lambda/${var.project}-${var.environment}-restore-validation"
  retention_in_days = 30
}

resource "aws_cloudwatch_event_rule" "backup_restore_completed" {
  name        = "${var.project}-${var.environment}-backup-restore-completed"
  description = "Trigger Lambda on AWS Backup restore completed"
  event_pattern = jsonencode({
    source        = ["aws.backup"],
    "detail-type" = ["Restore Job State Change"],
    detail = {
      status = ["COMPLETED"],
      "resourceType" : ["RDS"]
    }
  })
}

resource "aws_cloudwatch_event_target" "lambda_restore_validation" {
  rule      = aws_cloudwatch_event_rule.backup_restore_completed.name
  target_id = "lambda-restore-validation"
  arn       = aws_lambda_function.restore_validation.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.restore_validation.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.backup_restore_completed.arn
}

#Aurora
# Zip the lambda function source code
data "archive_file" "lambda_zip_restore_validation_aurora" {
  count = var.environment == "prod" ? 1 : 0

  type        = "zip"
  source_file = "${path.module}/lambda/lambda_create_aurora_instance.py"
  output_path = "./lambda_restore_validation_aurora.zip"
}

resource "aws_lambda_function" "aurora_restore_handler" {
  count = var.environment == "prod" ? 1 : 0

  filename         = data.archive_file.lambda_zip_restore_validation_aurora[0].output_path # Prepackaged .zip
  function_name    = "${var.project}-${var.environment}-restore-validation-aurora"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "lambda_create_aurora_instance.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.lambda_zip_restore_validation_aurora[0].output_base64sha256
  timeout          = 720

  layers = [
    var.boto3.arn,
    var.mysql_connector_python.arn
  ]

  environment {
    variables = {
      REGION         = var.region
      INSTANCE_CLASS = "db.t4g.medium",
      SECRET_ARN     = aws_secretsmanager_secret.db_credentials_admin.arn
    }
  }

  vpc_config {
    subnet_ids         = var.restore_private_subnet_ids
    security_group_ids = [aws_security_group.rds_sg.id, var.vpc_security_group_id]
  }
}

resource "aws_cloudwatch_event_rule" "aurora_restore_completed" {
  count = var.environment == "prod" ? 1 : 0

  name        = "aurora-restore-completed"
  description = "Triggers Lambda when Aurora restore completes via AWS Backup"
  event_pattern = jsonencode({
    "source" : ["aws.backup"],
    "detail-type" : ["Restore Job State Change"],
    "detail" : {
      "status" : ["COMPLETED"],
      "resourceType" : ["Aurora"]
    }
  })
}

resource "aws_cloudwatch_event_target" "trigger_lambda_on_restore" {
  count = var.environment == "prod" ? 1 : 0

  rule      = aws_cloudwatch_event_rule.aurora_restore_completed[0].name
  target_id = "InvokeAuroraRestoreLambda"
  arn       = aws_lambda_function.aurora_restore_handler[0].arn
}

resource "aws_lambda_permission" "allow_eventbridge_aurora" {
  count = var.environment == "prod" ? 1 : 0

  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.aurora_restore_handler[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.aurora_restore_completed[0].arn
}

resource "aws_cloudwatch_log_group" "lambda_restore_validation_aurora" {
  count = var.environment == "prod" ? 1 : 0

  name              = "/aws/lambda/${var.project}-${var.environment}-restore-validation-aurora"
  retention_in_days = 30
}

resource "aws_lambda_permission" "allow_lambda_invoke" {
  statement_id  = "AllowLambdaInvokeFromExecRole"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.restore_validation.function_name
  principal     = "sts.amazonaws.com"
  source_arn    = "arn:aws:iam::897729117054:role/ppp-prod-lambda-exec-role"
}
