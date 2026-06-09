# Outputs
output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "db_instance_address" {
  description = "RDS instance address"
  value       = aws_db_instance.postgresql.address
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgresql.port
}

output "db_name" {
  description = "Database name"
  value       = "postgres"
}

# Has to be given to quarkus ECS task using environment variable QUARKUS_DATASOURCE_JDBC_URL
output "jdbc_url" {
  description = "JDBC URL for Quarkus QUARKUS_DATASOURCE_JDBC_URL"
  value       = "jdbc:postgresql://${aws_db_instance.postgresql.endpoint}"
  #value       = "jdbc:postgresql://${aws_db_instance.postgresql.endpoint}/postgres?sslmode=require"
}

output "db_security_group_id" {
  description = "Security group ID for the database"
  value       = aws_security_group.rds.id
}

output "db_credentials_root" {
  description = "The secret containing the root database credentials."
  value       = aws_secretsmanager_secret.db_credentials_root
}

output "db_credentials_keycloak" {
  description = "The secret containing the Keycloak database credentials."
  value       = aws_secretsmanager_secret.db_credentials_keycloak
}

output "db_credentials_quarkus" {
  description = "The secret containing the Quarkus database credentials."
  value       = aws_secretsmanager_secret.db_credentials_quarkus
}

output "bastion_host" {
  description = "The bastion host for RDS access."
  value       = aws_instance.bastion_host[0]
}