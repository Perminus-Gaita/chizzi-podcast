import CustomError from '@/api-lib/error-handling/custom-error';

/**
 * Validates a single object against expected fields.
 * @param {Object} object - The object to validate.
 * @param {Object} expectedFields - An object where keys are field names and values are boolean indicating if the field is required.
 * @param {number} index - Optional index for array validation error messages.
 * @throws {CustomError} Throws a CustomError if validation fails.
 * @returns {Object} Returns an object containing only the expected fields.
 */
function validateSingleObject(object, expectedFields, index = null) {
    const missingFields = [];
    const unexpectedFields = [];
    const validatedFields = {};

    // Check for missing required fields and collect valid fields
    for (const [field, isRequired] of Object.entries(expectedFields)) {
        if (object[field] === undefined || object[field] === null || object[field] === '') {
            if (isRequired) {
                missingFields.push(field);
            }
        } else {
            validatedFields[field] = object[field];
        }
    }

    // Check for unexpected fields
    for (const field in object) {
        if (!expectedFields.hasOwnProperty(field)) {
            unexpectedFields.push(field);
        }
    }

    if (missingFields.length > 0 || unexpectedFields.length > 0) {
        let errorMessage = '';
        const itemIdentifier = index !== null ? ` in item ${index}` : '';
        
        if (missingFields.length > 0) {
            errorMessage += `Missing required fields${itemIdentifier}: ${missingFields.join(', ')}. `;
        }
        if (unexpectedFields.length > 0) {
            errorMessage += `Unexpected fields${itemIdentifier}: ${unexpectedFields.join(', ')}.`;
        }
        throw new CustomError(errorMessage.trim(), 400);
    }

    return validatedFields;
}

/**
 * Validates the request body, which can be either a single object or an array of objects.
 * @param {Object} request - The request object.
 * @param {Object} expectedFields - An object where keys are field names and values are boolean indicating if the field is required.
 * @param {Object} options - Optional configuration object.
 * @param {boolean} options.isArray - Whether to expect an array of objects (default: false).
 * @param {number} options.minItems - Minimum number of items required if isArray is true.
 * @param {number} options.maxItems - Maximum number of items allowed if isArray is true.
 * @throws {CustomError} Throws a CustomError if validation fails.
 * @returns {Object|Array} Returns validated fields, either as a single object or array of objects.
 */
export async function validateRequestBody(request, expectedFields, options = {}) {
    let body;
    
    try {
        // Safely attempt to parse the request JSON
        body = await request.json();
    } catch (error) {
        console.error("JSON parsing error:", error);
        throw new CustomError('Invalid JSON in request body', 400);
    }
    
    // Ensure body exists and is not null
    if (!body) {
        throw new CustomError('Request body is empty or invalid', 400);
    }
    
    const { isArray = false, minItems = 1, maxItems = Infinity } = options;

    if (isArray) {
        // Validate that body is an array
        if (!Array.isArray(body)) {
            throw new CustomError('Request body must be an array', 400);
        }

        // Validate array length
        if (body.length < minItems) {
            throw new CustomError(`Array must contain at least ${minItems} items`, 400);
        }
        if (body.length > maxItems) {
            throw new CustomError(`Array cannot contain more than ${maxItems} items`, 400);
        }

        // Validate each object in the array
        return body.map((item, index) => validateSingleObject(item, expectedFields, index));
    }

    // Handle single object validation
    return validateSingleObject(body, expectedFields);
}