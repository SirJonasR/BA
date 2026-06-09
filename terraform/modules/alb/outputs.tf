output "alb_sg" {
  description = "The security group for the ALB"
  value       = aws_security_group.alb_sg
}

output "alb_private" {
  description = "The private ALB"
  value       = aws_lb.private
}

output "alb_public" {
  description = "The public ALB"
  value       = aws_lb.public
}
