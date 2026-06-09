import os
import boto3
import mysql.connector
import logging
import json


def lambda_handler(event, context):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    logger.info(event)
    logger.info(context)

    # Extract DB info from event or environment variables
    db_host = os.environ.get('DB_HOST')
    db_port = os.environ.get('DB_PORT', '3306')
    db_name = os.environ.get('DB_NAME')
    secret_arn = os.environ.get('SECRET_ARN')
    region = event.get('region')

    # Get DB credentials from Secrets Manager
    secrets_client = boto3.client('secretsmanager', region_name=region)
    secret = secrets_client.get_secret_value(SecretId=secret_arn)
    creds = json.loads(secret['SecretString'])
    username = creds['username']
    password = creds['password']

    # Get DB hostname
    if not db_host:
        created_resource_arn = event.get('detail', {}).get('createdResourceArn')
        if created_resource_arn:
            rds_client = boto3.client('rds', region_name=region)
            try:
                response = rds_client.describe_db_instances(
                    DBInstanceIdentifier=created_resource_arn.split(':')[-1]
                )
                db_host = response['DBInstances'][0]['Endpoint']['Address']
                logger.info(f"Resolved DB host: {db_host}")
            except Exception as e:
                logger.error(f"Failed to resolve DB host from ARN: {e}")
                raise

    # Try to connect and run a simple query
    try:
        logger.info(f"Try to connect to the database '{db_host}' on port '{db_port}' with db_name '{db_name}'")
        conn = mysql.connector.connect(host=db_host, user=username, password=password, database=db_name, port=db_port,
                                       connection_timeout=5)
        logger.info("Connection to the database established successfully.")
        logger.info("Start test queries.")

        # Run validation tests
        succeeded, failed = validate_database_data(conn, logger)

        # Evaluate the results
        success = False if failed else True
        result = "Validation passed" if success else "Validation failed"  # Ensure 'result' is always defined
        logger.info(f"Restore validation done")

        if success:
            logger.info("Check if Aurora Instance")
            db_identifier = db_host.split('.')[0]
            rds_client = boto3.client('rds', region_name=region)
            response = rds_client.describe_db_instances(DBInstanceIdentifier=db_identifier)
            db_instance = response['DBInstances'][0]

            if 'Engine' in db_instance:
                if db_instance['Engine'] == 'aurora-mysql':
                    logger.info("Instance is part of an Aurora cluster. Deleting the instance.")
                    rds_client.delete_db_instance(
                        DBInstanceIdentifier=db_identifier,
                        SkipFinalSnapshot=True
                    )
                    logger.info("DB Instance deleted successfully")
            else:
                logger.info("Instance is not part of an Aurora cluster. Skipping deletion.")
    except Exception as e:
        logger.error(f"Restore validation failed: {e}")
        success, result = False, "Restore validation failed with unexpected error!"

    logger.info("Success: " + str(success))
    logger.info("Result: " + str(result))

    # Return the result to the Restore Job
    if event.get('detail') is not None:
        backup = boto3.client('backup', region_name=region)
        response = backup.put_restore_validation_result(
            RestoreJobId = event['detail']['restoreJobId'],
            ValidationStatus = "SUCCESSFUL" if success else "FAILED",
            ValidationStatusMessage = "SQL Test Succeeded" if success else "SQL Test Failed"
        )

        logger.info("Put restore validation result response: " + str(response))

    logger.info("Finished")


def validate_database_data(conn, logger):
    """
    Validates if the database contains plausible data after restoration.
    This function runs a series of SQL queries to check the integrity and plausibility of the data.

    :param conn: Active MySQL connection object
    :param logger: Logger object for logging information
    :return: None. Raises an exception if validation fails.
    """
    try:
        cursor = conn.cursor()

        succeeded = []
        failed = []

        # Check if there is data available in the database
        checks = [
            {"table": "user", "error": "No users found in the database.", "success": "User data check passed."},
            {"table": "project", "error": "No projects found in the database.", "success": "Project data check passed."},
            {"table": "department", "error": "No departments found in the database.", "success": "Department data check passed."},
            {"table": "employee", "error": "No employees found in the database.", "success": "Employee data check passed."}
        ]

        for check in checks:
            logger.info(f"Checking table: {check['table']}")
            query = f"SELECT COUNT(*) FROM {check['table']}"
            cursor.execute(query)
            count = cursor.fetchone()[0]
            if count < 1:
                failed.append(check["error"])
            else:
                succeeded.append(check["success"])

        # Check if an admin user exists
        logger.info("Checking for admin users")
        admin_query = """
        SELECT COUNT(*)
        FROM user_role ur
        LEFT JOIN role r
            ON ur.role_id = r.role_id
        WHERE r.role_name = 'ADMIN';
        """
        cursor.execute(admin_query)
        admin_count = cursor.fetchone()[0]
        if admin_count < 1:
            failed.append("No admin users found in the database.")
        else:
            succeeded.append("Admin user check passed.")

        # Return the results
        return succeeded, failed

    except Exception as e:
        logger.error(f"Database validation failed: {e}")
        raise
    finally:
        cursor.close()
