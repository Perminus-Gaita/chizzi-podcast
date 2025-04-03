import axios from 'axios';

/**
 * Exchanges an authorization code for Google OAuth tokens and retrieves user information
 * @param {string} code - The authorization code from Google OAuth
 * @returns {Promise<{name: string, picture: string, id: string, email: string, tokens: {access_token: string, refresh_token?: string, expiry_date: number}}>}
 * @throws {Error} If the authorization code exchange fails or user info cannot be retrieved
 */
export async function exchangeCodeForTokensAndGetUserInfo(code) {
    if (!code || typeof code !== 'string') {
        throw new Error('Valid authorization code is required');
    }

    try {
        // create redirect url.
        const googleRedirectUri = `${process.env.MYHOSTNAME}/api/auth/google/sign-in/callback`;
        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: googleRedirectUri,
            grant_type: 'authorization_code'
        });

        const { 
            access_token, 
            refresh_token, 
            expires_in 
        } = tokenResponse.data;

        if (!access_token) {
            throw new Error('Failed to obtain access token from Google');
        }

        // Calculate token expiry date
        const expiry_date = Date.now() + (expires_in * 1000);
    
        // Get user info using the access token
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { 
                Authorization: `Bearer ${access_token}`,
                'Accept': 'application/json'
            }
        });
  
        const { name, picture, id, email } = userInfoResponse.data;

        // Validate required user info
        if (!id || !email) {
            throw new Error('Required user information missing from Google response');
        }

        return {
            name, 
            picture, 
            id, 
            email,
            tokens: {
                access_token,
                refresh_token, // May be undefined for subsequent logins
                expiry_date
            }
        };
    } catch (error) {
        // Handle specific axios errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`Google OAuth error: ${error.response.data.error_description || error.response.data.error || 'Unknown error'}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('Failed to connect to Google OAuth service');
        }
        
        // Handle other errors
        console.error('Error in exchangeCodeForTokensAndGetUserInfo:', error);
        throw new Error('Failed to authenticate with Google: ' + (error.message || 'Unknown error'));
    }
}