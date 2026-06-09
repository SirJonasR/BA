### Terraform project to create common resources for dev/prod environments

This project typically needs to be run once for each project to setup.
It sets up the necessary resources, users, roles, permissions etc. required for the main terraform project to function correctly.
Also sets up the common resources that are shared across different projects and environments.

Currently, it creates the following resources:
- ECR Repositories (PPP)

## Prerequisites:
- AWS Account with Administrator access
- S3 Bucket configured for Terraform state files (eg `ppp-setup-terraform-state-bucket`), with versioning enabled

## How to run:
- `terraform init -backend-config="envs/ppp-state.config" -reconfigure`
- `terraform plan -var-file="envs/ppp.tfvars"`
- `terraform apply -var-file="envs/ppp.tfvars"`
- `terraform output tf_access_key_id`
- `terraform output tf_secret_access_key`


## Permissions

Permissions are defined in the terraform_admin module.

**How to initially get** all needed **permissions** for the TerraformAdmin Role:
- Add Admin Permissions to the `pppTerraformAdministrator` - Role
- Activate Cloud Trail and IAM Access Analyzer
- Run all Terraform commands (delete, plan, apply) and therefore deconstruct/construct the whole infrastructure at least once
- Move to the `pppTerraformAdministrator` - Role
- Use Access Analyzer to create a Policy (Policies might be split into multiple policies, because of length constraints)
- This will give a solid base to start of from, but won't be complete
- Generated output is in [TerraformPlainGeneratedPolicy](docs/TerraformPlainGeneratedPolicy.json)
- Apply the generated Policy to the `TerraformAdmin` - Role and remove Admin permissions
- Then run Terraform, add permissions if errors occur, repeat until there are no more errors about missing permissions 

