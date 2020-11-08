const { URLSearchParams } = require('url')
const fetch = require('node-fetch')

const {LINKEDIN_SECRET, FULL_DOMAIN} = process.env;
const LINKEDIN_ACCESS_TOKEN = `https://www.linkedin.com/oauth/v2/accessToken`
const LINKEDIN_CLIENT_ID = '77rkr2euf8hsvc'
const LINKEDIN_CLIENT_SECRET = LINKEDIN_SECRET;

const LINKEDIN_RIDERECT_URI = `${FULL_DOMAIN}/linkedin`;
const LINKEDIN_NAME_URL = 'https://api.linkedin.com/v2/me'
const LINKEDIN_IMG_URL ='https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,emailAddress,profilePicture(displayImage~:playableStreams))';

const LINKEDIN_EMAIL_URL =
    'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))';

const fetchJSON = (...args) => fetch(...args).then(r => r.json())

const getValidatedWithLinkedinUser = async code => {
    //console.log(code)
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_RIDERECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET
    })
    const { access_token } = await fetchJSON(LINKEDIN_ACCESS_TOKEN, {
        method: 'POST',
        body
    })

    const payload = {
        method: 'GET',
        headers: { Authorization: `Bearer ${access_token}` }
    }
    const profileData = await fetchJSON(
        LINKEDIN_NAME_URL,
        payload
    )


    const { localizedFirstName, localizedLastName, id } = profileData;

    const profileImageData = await fetchJSON(
        LINKEDIN_IMG_URL,
        payload
    )


    let profileImage = "";
    if(profileImageData.profilePicture["displayImage~"] &&
        profileImageData.profilePicture["displayImage~"].elements[0] &&
        profileImageData.profilePicture["displayImage~"].elements[0].identifiers &&
        profileImageData.profilePicture["displayImage~"].elements[0].identifiers[0] &&
        profileImageData.profilePicture["displayImage~"].elements[0].identifiers[0].identifier
    ) {
        profileImage = profileImageData.profilePicture["displayImage~"].elements[0].identifiers[0].identifier;
    }


    const { elements } = await fetchJSON(LINKEDIN_EMAIL_URL, payload)

    return {
        firstName: `${localizedFirstName}`,
        lastName: `${localizedLastName}`,
        email: elements[0]['handle~'].emailAddress,
        profileImage: profileImage,
        id
    }
}

module.exports = {getValidatedWithLinkedinUser};