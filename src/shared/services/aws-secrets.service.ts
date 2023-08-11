// injectable provider that gets aws secrets from the aws secrets manager

import { Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

export const GetAWSSecrets = async () => {
    let error;

    const logger = new Logger(GetAWSSecrets.name);

    const region = 'us-east-2';
    const SecretId = process.env.AWS_SECRETS_ID;

    if (!SecretId) return;

    const client = new AWS.SecretsManager({ region });

    const secrets = await client
        .getSecretValue({ SecretId })
        .promise()
        .catch((err) => (error = err));
    if (error) {
        if (error.code === 'DecryptionFailureException')
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            logger.error(error);
        else if (error.code === 'InternalServiceErrorException')
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            logger.error(error);
        else if (error.code === 'InvalidParameterException')
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            logger.error(error);
        else if (error.code === 'InvalidRequestException')
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            logger.error(error);
        else if (error.code === 'ResourceNotFoundException')
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            logger.error(error);
    }

    try {
        const resultSecrets = JSON.parse(secrets.SecretString);
        process.env = { ...resultSecrets, ...process.env };

        return resultSecrets;
    } catch (error) {
        logger.error(error);
        return null;
    }
};
