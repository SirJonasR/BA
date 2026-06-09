output "aws_db_instance_mysql" {
  description = "The MySQL RDS instance."
  value       = var.environment == "dev" ? aws_db_instance.mysql[0] : null
}

output "aws_db_instance_mysql_arn" {
  description = "The MySQL RDS instance."
  value       = var.environment == "dev" ? aws_db_instance.mysql[0].arn : null
}

output "aws_db_instance_mysql_endpoint" {
  description = "The endpoint of the MySQL RDS instance."
  value       = var.environment == "dev" ? aws_db_instance.mysql[0].endpoint : null
}

output "aws_db_aurora_cluster" {
  description = "The Aurora Cluster."
  value       = var.environment == "prod" ? aws_rds_cluster.aurora_cluster[0] : null
}

output "aws_db_aurora_cluster_arn" {
  description = "The Aurora Cluster ARN."
  value       = var.environment == "prod" ? aws_rds_cluster.aurora_cluster[0].arn : null
}
output "aws_db_aurora_cluster_endpoint" {
  description = "The Aurora Cluster Endpoint."
  value       = var.environment == "prod" ? aws_rds_cluster.aurora_cluster[0].endpoint : null
}

output "aws_security_group" {
  description = "The RDS security group."
  value       = aws_security_group.rds_sg
}

output "bastion_host" {
  description = "The bastion host for RDS access."
  value       = aws_instance.bastion_host[0]
}

output "db_credentials" {
  description = "The secret containing the database credentials."
  value       = aws_secretsmanager_secret.db_credentials
}

output "db_credentials_admin" {
  description = "The secret containing the admin database credentials."
  value       = aws_secretsmanager_secret.db_credentials_admin
}

output "db_credentials_root" {
  description = "The secret containing the root database credentials."
  value       = aws_secretsmanager_secret.db_credentials_root
}
