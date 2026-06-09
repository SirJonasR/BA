> :warning: Only run these commands in consultation with TecRadar team (Michael Heinen, Epiphane Lawson, Mirco Boettcher).
> Be very careful which branch is selected, as necessary infrastructure might be destroyed

## Setup
Run aws configure and enter the access key and secret access key for the TecRadar Terraform Administrator IAM user. This avoids storing the access keys in the local or remote project repository.

The provided terraform.example.tfvars file shows how custom usernames for keycloak admin and the db root user can be set.
## Terraform-Commands
**DEV-Environment** (no additional tfvars needed, the exact commands shown dev.tfvars are sufficient)
- `terraform init -backend-config="envs/dev-state.config" -reconfigure`
- `terraform plan -var-file="envs/dev.tfvars"`
- `terraform apply -var-file="envs/dev.tfvars"`

**PROD-Environment** (optionally, an additional tfvars can be provided to customize keycloak admin and root db usernames. You might not be able to change the root db username without recreating the db)
- `terraform init -backend-config="envs/prod-state.config" -reconfigure`
- `terraform plan -var-file="envs/prod.tfvars"`
- `terraform apply -var-file="envs/prod.tfvars"`