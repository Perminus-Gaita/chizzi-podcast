import { google } from 'googleapis';
import YoutubeAccountProfile from "@/models/account/youtube/profile.model";

import database_connection from "@/services/database";

database_connection().then(() =>
  console.log("Connected successfully ##Youtube Analytics")
);

export default async function handler(accountProfileId) {
    try {
        const credentials = await getYoutubeAccountProfileCredentials(accountProfileId);
        if (credentials.isAccessTokenValid) {
            return { 
                youtubeAccessToken: credentials.youtubeAccessToken,
                youtubeRefreshToken: credentials.youtubeRefreshToken
            };
        } else {
            const newYoutubeCredentials = await getNewYoutubeCredentials(credentials.youtubeRefreshToken);
            const updatedYoutubeAccountProfile = await updateYoutubeAccountProfileCredentials(accountProfileId, {
                accessToken: newYoutubeCredentials.accessToken,
                accessTokenExpiryDate: newYoutubeCredentials.accessTokenExpiryDate,
                accessTokenScope: newYoutubeCredentials.accessTokenScope,
                refreshToken: credentials.youtubeRefreshToken,
                tokensIssuedAt: new Date()
            });
            return { 
                youtubeAccessToken: updatedYoutubeAccountProfile.credentials.accessToken,
                youtubeRefreshToken: updatedYoutubeAccountProfile.credentials.refreshToken
            };
        }
    } catch (error) {
        throw error;
    }
};

// Get the accountProfile document from the database
async function getYoutubeAccountProfileCredentials(accountProfileId) {
    const youtubeAccountProfile = await YoutubeAccountProfile.findById(accountProfileId).lean().exec();
    if (!youtubeAccountProfile) {
        throw new Error('Account profile not found');
    }
    if (!youtubeAccountProfile.credentials.accessToken) {
        throw new Error('Youtube access token not found'); 
    }
    if (!youtubeAccountProfile.credentials.accessTokenExpiryDate) {
        throw new Error('Page access token expiry date not found');
    }
    if (!youtubeAccountProfile.credentials.refreshToken) {
        throw new Error('Youtube refresh token not found'); 
    }
    const credentials = {
        isAccessTokenValid: accessTokenIsValid(youtubeAccountProfile.credentials.accessTokenExpiryDate),
        youtubeAccessToken: youtubeAccountProfile.credentials.accessToken,
        youtubeRefreshToken: youtubeAccountProfile.credentials.refreshToken
    };
    return credentials;
}

// Check if the access token is valid
function accessTokenIsValid(expiryDate) {
    const currentTime = new Date();
    const expiryMinus10 = new Date(expiryDate.getTime() - 10 * 60 * 1000);
    return currentTime < expiryMinus10;
}

// Get new Youtube credentials from the Youtube API
async function getNewYoutubeCredentials(youtubeRefreshToken) {
    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );

        oauth2Client.setCredentials({
            refresh_token: youtubeRefreshToken
        });

        const tokens = await new Promise((resolve, reject) => {
            oauth2Client.refreshAccessToken((err, tokens) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(tokens);
                }
            });
        });
          
        return {
            accessToken: tokens.access_token,
            accessTokenScope: tokens.scope,
            accessTokenExpiryDate: tokens.expiry_date,
            refreshToken: tokens.refresh_token,
            tokenType: tokens.token_type,
        };
    } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
    }
}

// Update the accountProfile document with new credentials in the database
async function updateYoutubeAccountProfileCredentials(accountProfileId, credentials) {
    const updatedYoutubeAccountProfile = await YoutubeAccountProfile.findByIdAndUpdate(
        accountProfileId, 
        {
            credentials: {
                accessToken: credentials.accessToken,
                accessTokenExpiryDate: credentials.accessTokenExpiryDate,
                accessTokenScope: credentials.accessTokenScope,
                refreshToken: credentials.refreshToken,
                tokensIssuedAt: credentials.tokensIssuedAt
            }
        },
        { new: true }
    ).lean().exec();
    if (!updatedYoutubeAccountProfile) {
        throw new Error('Youtube account profile not found');
    }
    return updatedYoutubeAccountProfile;
}