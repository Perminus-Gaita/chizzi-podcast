/**
 * Retrieves the environment-specific variable based on the current environment.
 * Throws an error if the variable is undefined.
 * @param {string} baseName - The base name of the environment variable.
 * @returns {string} The value of the environment-specific variable.
 * @throws {Error} If the environment-specific variable is undefined.
 */
export function getEnvironmentSpecificEnvVariable(baseName) {
  const environment = process.env.ENVIRONMENT;
  if (environment === undefined) {
    throw new Error(`Environment env variable not set.`);
  }

  // get the full env variable name
  const variableName = `${baseName}_${environment.toUpperCase()}`;
  const value = process.env[variableName];
  if (value === undefined) {
    throw new Error(`Environment-specific variable ${variableName} is not defined.`);
  }
  
  return value;
}
  
  // Usage example:
  // try {
  //   const secretKey = getEnvironmentSpecificVariable('SECRET_KEY');
  //   const databaseUrl = getEnvironmentSpecificVariable('DATABASE_URL');
  // } catch (error) {
  //   console.error('Configuration error:', error.message);
  // }