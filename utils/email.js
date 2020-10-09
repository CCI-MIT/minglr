module.exports = {
    getEmailSenderConfiguration : () => {

        if (process.env.EMAIL_PROVIDER == "gmail") {
            const config =
                {
                    service: `${process.env.EMAIL_PROVIDER}`,
                    auth: {
                        user: `${process.env.EMAIL_ADDRESS}`,
                        pass: `${process.env.EMAIL_PASSWORD}`,
                    }
                }
            return config;

        } else {
            const config = {

                host: "smtp.sendgrid.net",
                port: 465,
                secureConnection: true,
                auth: {
                    user: `apikey`,
                    pass: `${process.env.EMAIL_PASSWORD}`
                },
                tls: {
                    secureProtocol: "TLSv1_method"
                }

            }

            return config;
        }

    }
}
