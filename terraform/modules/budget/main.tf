# Create AWS Budget, which sends notification mails (at 90, 100, 120% threshold)
# and triggers Lambda Function at 120% threshold, to shutdown ECS Services
resource "aws_budgets_budget" "main" {
  name              = "${var.project}-${var.environment}-budget-monthly"
  budget_type       = "COST"
  limit_amount      = var.cost_limit
  limit_unit        = "USD"
  time_period_end   = "2087-06-15_00:00"
  time_period_start = "2017-07-01_00:00"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 90
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.cost_notification_emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.cost_notification_emails
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 120
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = var.cost_notification_emails
    subscriber_sns_topic_arns  = [aws_sns_topic.budget_alert_topic.arn]
  }

  cost_filter {
    name = "TagKeyValue"
    values = [
      "user:Project${"$"}${var.project}",
      "user:Environment${"$"}${var.environment}",
    ]
  }

  tags = {
    Name    = "${var.project}-${var.environment}-budget-monthly"
    Project = var.project
  }
}

########################
# SNS (Simple Notification Service)
########################
# create SNS topic
resource "aws_sns_topic" "budget_alert_topic" {
  name = "${var.project}-${var.environment}-budget-alert-topic"
}
