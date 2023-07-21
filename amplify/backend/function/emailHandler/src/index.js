

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const aws = require('aws-sdk');
const SES = new aws.SES();
exports.handler = async (event) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const info = record.dynamodb.NewImage;
      const time = new Date(parseInt(info.time.N));
      const appLength = info.type.S === '90' ? '90 Minutes' : '1 Hour';
      const emailBodyText = `Client: ${info.client.S}\nTime (Pacific Timezone): ${time.toLocaleString('en-US', { timeZone: "America/Los_Angeles", year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\nLength: ${appLength}\nAdditional notes: ${info.note.S || 'None'}`;
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [info.email.S],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'New massage appointment created' },
            Body: {
              Text: {
                Data: emailBodyText
              }
            },
          },
        })
        .promise()
      await delay(2000)
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [process.env.EmailAddress],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'New massage appointment created' },
            Body: {
              Text: {
                Data: emailBodyText  
              },
            },
          },
        })
        .promise()
    } else if (record.eventName === 'MODIFY') {
      const info = record.dynamodb.NewImage;
      const time = new Date(parseInt(info.time.N));
      const appLength = info.type.S === '90' ? '90 Minutes' : '1 Hour';
      const oldInfo = record.dynamodb.OldImage;
      const oldTime = new Date(parseInt(oldInfo.time.N));
      const emailBodyText = info.time.N === oldInfo.time.N ?
        `Client: ${info.client.S}\nPrevious Time (Pacific Timezone): ${oldTime.toLocaleString('en-US', { timeZone: "America/Los_Angeles", year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\nUpdated Time (Pacific Timezone): Time unchanged\nLength: ${appLength}\nAdditional notes: ${info.note.S || 'None'}`
        :
        `Client: ${info.client.S}\nPrevious Time (Pacific Timezone): ${oldTime.toLocaleString('en-US', { timeZone: "America/Los_Angeles", year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\nUpdated Time (Pacific Timezone): ${time.toLocaleString('en-US', { timeZone: "America/Los_Angeles", year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}\nLength: ${appLength}\nAdditional notes: ${info.note.S || 'None'}`

      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [info.email.S],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment updated' },
            Body: {
              Text: {
                Data: emailBodyText
              }
            },
          },
        })
        .promise()
        await delay(2000)
        await SES
        .sendEmail({
          Destination: {
            ToAddresses: [process.env.EmailAddress],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment updated' },
            Body: {
              Text: {
                Data: emailBodyText
              }
            },
          },
        })
        .promise()
    } else if (record.eventName === 'REMOVE') {
      const oldInfo = record.dynamodb.OldImage;
      const oldTime = new Date(parseInt(oldInfo.time.N));
      const emailBodyText = `Client: ${oldInfo.client.S}\nPrevious Time (Pacific Timezone): ${oldTime.toLocaleString('en-US', { timeZone: "America/Los_Angeles", year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`
      await SES
        .sendEmail({
          Destination: {
            ToAddresses: [oldInfo.email.S],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment cancelled' },
            Body: {
              Text: {
                Data: emailBodyText
              },
            },
          },
        })
        .promise()
        await delay(2000)
        await SES
        .sendEmail({
          Destination: {
            ToAddresses: [process.env.EmailAddress],
          },
          Source: process.env.EmailAddress,
          Message: {
            Subject: { Data: 'Massage appointment cancelled' },
            Body: {
              Text: {
                Data: emailBodyText
              },
            },
          },
        })
        .promise()
    }

  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
