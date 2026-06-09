data "aws_route53_zone" "parent_zone" {
  name         = var.tld
  private_zone = false
}

data "aws_route53_zone" "keycloak_zone" {
  name = "keycloak.${var.tld}"
}
