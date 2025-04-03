import { getEnvironmentSpecificEnvVariable } from '@/lib/env/get-environment-specific-env-variable'

export const getIotCoreHttpsUrl = () => {
    const AWSIoTEndpoint = getEnvironmentSpecificEnvVariable("AWS_IOT_ENDPOINT");
    return `https://${AWSIoTEndpoint}`;
};



