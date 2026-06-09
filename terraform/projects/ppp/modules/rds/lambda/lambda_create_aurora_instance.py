import boto3
import os
import logging
import time
import json

rds = boto3.client('rds')
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Log the incoming event for debugging
    logger.info(event)
    logger.info(context)

    detail = event.get("detail", {})
    resource_arn = detail.get("createdResourceArn", "")

    # Extract the cluster identifier from ARN (last part)
    cluster_id = resource_arn.split(":")[-1]
    logger.info(f"Restoring instance into cluster: {cluster_id}")

    # Construct an instance identifier (must be unique and valid)
    sanitized_cluster_id = cluster_id.rstrip('-')  # Remove trailing hyphens if any
    sanitized_cluster_id = sanitized_cluster_id.replace('--', '-')  # Replace consecutive hyphens
    instance_id = f"{sanitized_cluster_id}-auto-instance"

    instance_exists = False

    if len(instance_id) > 63:
        instance_id = instance_id[:63]  # Truncate to 63 characters

    try:
        existing_instance = rds.describe_db_instances(DBInstanceIdentifier=instance_id)
        instance_exists = True
        logger.info(f"DB instance {instance_id} already exists. Skipping creation.")
    except rds.exceptions.DBInstanceNotFoundFault:
        logger.info(f"DB instance {instance_id} does not exist. Proceeding with creation.")

    try:
        if not instance_exists:
            response = rds.create_db_instance(
                DBInstanceIdentifier=instance_id,
                DBClusterIdentifier=cluster_id,
                Engine='aurora-mysql',
                DBInstanceClass=os.environ.get("INSTANCE_CLASS", "db.t4g.medium"),
                PubliclyAccessible=False,
                Tags=[
                    {"Key": "Project", "Value": "RestoreTest"},
                    {"Key": "CreatedBy", "Value": "LambdaRestore"}
                ]
            )
            logger.info(f"Successfully initiated creation of DB instance {instance_id}")

            # Wait for it to become available
            wait_for_instance(instance_id, logger=logger)

        # Trigger the validation Lambda
        lambda_client.invoke(
            FunctionName="ppp-prod-restore-validation",
            InvocationType="Event",  # Async
            Payload=json.dumps({
                "instance_id": instance_id,
                "region": os.environ.get("AWS_REGION", "us-west-2"),
                "detail": {
                    "restoreJobId": event['detail']['restoreJobId'],
                    "createdResourceArn": instance_id
                }
            })
        )
    except rds.exceptions.DBInstanceAlreadyExistsFault:
        logger.info(f"Instance {instance_id} already exists. Skipping creation.")
        return {"status": "already_exists"}

    except Exception as e:
        logger.info(f"Error creating DB instance: {str(e)}")
        raise


def wait_for_instance(instance_id, timeout_minutes=10, logger=None):
    timeout = time.time() + timeout_minutes * 60
    while time.time() < timeout:
        response = rds.describe_db_instances(DBInstanceIdentifier=instance_id)
        logger.info(instance_id)
        status = response['DBInstances'][0]['DBInstanceStatus']
        logger.info(f"{instance_id} status: {status}")
        if status == 'available':
            return True
        time.sleep(30)
    raise Exception("Instance did not become available in time.")
