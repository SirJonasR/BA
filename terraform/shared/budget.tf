###########################################################
# Budget Module Configuration
###########################################################
module "budget" {
  source = "../modules/budget"

  project     = var.project
  environment = var.environment
  region      = var.region

  cost_limit               = var.cost_limit
  cost_notification_emails = var.cost_notification_emails

}
