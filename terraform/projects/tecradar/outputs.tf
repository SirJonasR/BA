output "bastion_ec2_id" {
  value = module.rds.bastion_host.id
}

output "db_host" {
  value = module.rds.db_instance_address
}

output "alb_public_url" {
  value = local.alb.alb_public.dns_name
}