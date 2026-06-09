output "sns_budget_alert_topic" {
  description = "SNS topic for budget alerts"
  value       = aws_sns_topic.budget_alert_topic
}
