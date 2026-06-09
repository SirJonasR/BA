account_id  = "897729117054"
project     = "ppp"
environment = "prod"
region      = "eu-north-1"
vpc_cidr    = "10.1.0.0/16"
tld         = "3p-ams.de"

backend_repo  = "ppp_repo_backend"
frontend_repo = "ppp_repo_frontend"
keycloak_repo = "ppp_repo_keycloak"

# How many instances each of frontend, backend, keycloak should be run at day/night time at minimum and maximum
timezone                 = "Europe/Berlin"
start_day_time           = "cron(0 6 * * ? *)" # 6:00 AM UTC
scaling_target_day_min   = 1
scaling_target_day_max   = 1
start_night_time         = "cron(0 22 * * ? *)" # 10:00 PM UTC
scaling_target_night_min = 1
scaling_target_night_max = 1

# Cost limit for whole AWS acc.... So dev and prod environment combined
# Filtering by cost tags is not possible in AWS budgets, because:
#   "Access Denied Cost allocation tags are managed at the payer account level."
cost_limit               = "350"
cost_notification_emails = ["daniel.theler@eviden.com", "dirkwinter@eviden.com", "marvin.kohlmann@eviden.com"]

####################
# Database
####################
db_name             = "ppp_database" # This is the db used for keycloak
db_name_app         = "ppp_app"      # This is the db used for the backend
db_username_root    = "admin"        # Root db user
db_username_admin   = "spdb_admin"   # Admin db user
db_username         = "backend_app"  # db user
engine              = "aurora-mysql"
engine_version      = "8.0.mysql_aurora.3.10.0"
instance_class      = "db.t4g.medium"
allocated_storage   = 20
skip_final_snapshot = false
deletion_protection = true
storage_encrypted   = true


####################
# Keycloak
####################
keycloak_admin_username = "admin"
kc_memory               = 1024
kc_cpu                  = 256

realm_name = "3p-ams"
smtp_host  = "email-smtp.eu-north-1.amazonaws.com"
smtp_port  = "465"
smtp_from  = "noreply@3p-ams.de"

####################
# Frontend
####################
fe_memory = 512
fe_cpu    = 256


####################
# Backend
####################
be_memory = 512
be_cpu    = 256


####################
# Secrets receiving from Env variable
####################
# aws_access_key          = ""
# aws_secret_key          = ""
# keycloak_admin_password = ""
# keycloak_secret         = ""
# next_auth_secret        = ""
# db_password             = ""
# db_password_admin       = ""
# smtp_username           = ""
# smtp_password           = ""
