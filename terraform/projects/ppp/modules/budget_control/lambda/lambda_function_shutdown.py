import os
import boto3

def lambda_handler_shutdown(event, context):
    ecs_client = boto3.client('application-autoscaling')
    cluster_name = os.environ['CLUSTER_NAME']
    services = os.environ['SERVICES'].split(',')

    print('Start shutdown of services!')

    for service in services:

        response = ecs_client.register_scalable_target(
            ServiceNamespace='ecs',  # The namespace of the AWS service
            ResourceId=f'service/{cluster_name}/{service}',  # The identifier of the resource associated with the scalable target
            ScalableDimension='ecs:service:DesiredCount',  # The scalable dimension associated with the scalable target
            MinCapacity=0,  # The minimum value to scale to
            MaxCapacity=0  # The maximum value to scale to
        )

        print(f'Shut down service: {service}, response: {response}')

    return {
        'statusCode': 200,
        'body': 'Services shutdown successfully'
    }

def lambda_handler_startup(event, context):
    ecs_client = boto3.client('application-autoscaling')
    cluster_name = os.environ['CLUSTER_NAME']
    services = os.environ['SERVICES'].split(',')

    print('Startup of services!')

    for service in services:

        response = ecs_client.register_scalable_target(
            ServiceNamespace='ecs',  # The namespace of the AWS service
            ResourceId=f'service/{cluster_name}/{service}',  # The identifier of the resource associated with the scalable target
            ScalableDimension='ecs:service:DesiredCount',  # The scalable dimension associated with the scalable target
            MinCapacity=1,  # The minimum value to scale to
            MaxCapacity=1  # The maximum value to scale to
        )

        print(f'Start up service: {service}, response: {response}')

    return {
        'statusCode': 200,
        'body': 'Services startup successfully'
    }
