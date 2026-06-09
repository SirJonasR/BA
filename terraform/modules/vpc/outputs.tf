output "vpc" {
  description = "The VPC created"
  value       = aws_vpc.main
}

output "db_subnet_group_names" {
  description = "Names of the DB subnet groups created in the VPC module"
  value = {
    public  = aws_db_subnet_group.public.name
    private = aws_db_subnet_group.private.name
  }
}

output "public_subnets" {
  description = "IDs of public Subnets"
  value = aws_subnet.public[*]
}

output "private_subnets" {
  description = "IDs of private Subnets"
  value = aws_subnet.private[*]
}

output "ecs_cluster_sg" {
  description = "Security group for ECS cluster"
  value       = aws_security_group.ecs_cluster_sg
}
