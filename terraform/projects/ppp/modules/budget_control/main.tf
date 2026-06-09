# Allow SNS to call Lambda
resource "aws_lambda_permission" "allow_sns_to_call_lambda" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.budget_alert_lambda_shutdown.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = var.sns_budget_alert_topic.arn
}


resource "aws_sns_topic_policy" "allow_budgets_publish_access" {
  arn = var.sns_budget_alert_topic.arn

  policy = data.aws_iam_policy_document.sns_topic_default_plus_budgets_policy.json
}

########################
# Lambda function
########################
# Permissions
resource "aws_iam_policy" "lambda_autoscaling_policy" {
  name        = "${var.project}-${var.environment}-lambda-autoscaling-policy"
  description = "Policy to allow Lambda function to register scalable targets"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "application-autoscaling:RegisterScalableTarget",
          "application-autoscaling:DeregisterScalableTarget",
          "application-autoscaling:DescribeScalableTargets",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project}-${var.environment}-lambda-autoscaling-policy"
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "lambda_autoscaling_policy_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_autoscaling_policy.arn
}

# Define Lambda functions
resource "aws_lambda_function" "budget_alert_lambda_shutdown" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project}-${var.environment}-lambda-shutdown"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "lambda_function_shutdown.lambda_handler_shutdown"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.12"

  layers = [
    var.klayers_boto3_package.arn,
  ]

  environment {
    variables = {
      CLUSTER_NAME = var.ecs_cluster.name
      SERVICES     = var.service_names
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda_shutdown_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.budget_alert_lambda_shutdown.function_name}"
  retention_in_days = 30
}

resource "aws_lambda_function" "budget_alert_lambda_startup" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project}-${var.environment}-lambda-startup"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "lambda_function_shutdown.lambda_handler_startup"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.12"

  environment {
    variables = {
      CLUSTER_NAME = var.ecs_cluster.name
      SERVICES     = var.service_names
    }
  }
}

resource "aws_cloudwatch_log_group" "lambda_startup_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.budget_alert_lambda_startup.function_name}"
  retention_in_days = 30
}

# Subscribe Lambda function to sns topic
resource "aws_sns_topic_subscription" "budget_alert_subscription" {
  topic_arn = var.sns_budget_alert_topic.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.budget_alert_lambda_shutdown.arn
}